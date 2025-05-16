import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject, from, throwError } from 'rxjs';
import { mergeMap, mapTo, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertCtrl: AlertController
  ) {
    this.loadUserFromStorage();
  }

  private async loadUserFromStorage() {
    const { value } = await Preferences.get({ key: 'user' });
    if (value) {
      this.currentUserSubject.next(JSON.parse(value));
    }
  }

  get currentUser() {
    return this.currentUserSubject.asObservable();
  }

  register(data: { pseudo: string; email: string; password: string; }) {
    return this.http.post(
      `${environment.apiUrl}/register`,
      data
    ).pipe(
      catchError(err => throwError(() => err))
    );
  }

  login(email: string, password: string) {
    return this.http.post<any>(
      `${environment.apiUrl}/login`,
      { email, password }
    ).pipe(
      // 1) Gestion du cas « compte en attente de validation »
      mergeMap(data => {
        const roles: string[] = data.user.roles || [];
        if (roles.length === 0) {
          // alerte + redirection
          this.alertCtrl
            .create({
              header: 'Compte non validé',
              message: 'Votre compte est toujours en attente de validation.',
              buttons: ['OK']
            })
            .then(alert =>
              alert.present().then(() => this.router.navigateByUrl('/auth/login'))
            );
          return throwError(() => new Error('Compte en attente de validation'));
        }

        // 2) Sinon, on stocke l’utilisateur et on émet
        return from(
          Preferences.set({ key: 'user', value: JSON.stringify(data.user) })
        ).pipe(
          mapTo(data.user),
          mergeMap(user => {
            this.currentUserSubject.next(user);
            return [user];
          })
        );
      }),

      catchError(err => {
        if (err.status === 401) {
          this.alertCtrl
            .create({
              header: 'Erreur de connexion',
              message: 'Email ou mot de passe incorrect.',
              buttons: ['OK']
            })
            .then(alert => alert.present());
        }
          return throwError(() => new Error('Email ou mot de passe incorect'));
      })
    );
  }

  async logout() {
    await Preferences.remove({ key: 'user' });
    this.currentUserSubject.next(null);
    this.router.navigateByUrl('/auth/login');
  }

  async getToken() {
    const { value } = await Preferences.get({ key: 'user' });
    if (value) {
      const user = JSON.parse(value);
      return user.token;
    }
    return null;
  }
}
