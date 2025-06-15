// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject, from, throwError } from 'rxjs';
import { mergeMap, mapTo, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

import { environment } from 'src/environments/environment';

export interface Session {
  id: number;
  email: string;
  roles: string[];
  token: string;
  // … tout autre champ user
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<Session|null>(null);
  private jwtToken: string|null = null;          // ← token en mémoire

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
      const session: Session = JSON.parse(value);
      this.jwtToken = session.token;              // ← on restaure le token
      this.currentUserSubject.next(session);
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
    return this.http
      .post<{ token: string; user: any }>(
        `${environment.apiUrl}/login`,
        { email, password }
      )
      .pipe(

        mergeMap(data => {
          this.jwtToken = data.token;


          const session: Session = {
            ...data.user,
            token: data.token
          };

          return from(
            Preferences.set({ key: 'user', value: JSON.stringify(session) })
          ).pipe(
            mapTo(session)
          );
        }),

        mergeMap(session => {
          this.currentUserSubject.next(session);
          return [session];
        }),

        catchError(err => {
          if (err.status === 401) {
            this.alertCtrl.create({
              header: 'Erreur de connexion',
              message: 'Email ou mot de passe incorrect.',
              buttons: ['OK']
            }).then(a => a.present());
          }
          return throwError(() => new Error('Email ou mot de passe incorrect'));
        })
      );
  }

  async logout() {
    this.jwtToken = null;                         
    await Preferences.remove({ key: 'user' });
    this.currentUserSubject.next(null);
    this.router.navigateByUrl('/auth/login');
  }


  async getToken(): Promise<string|null> {
    if (this.jwtToken) {
      return this.jwtToken;
    }
    const { value } = await Preferences.get({ key: 'user' });
    if (!value) {
      return null;
    }
    const session: Session = JSON.parse(value);
    this.jwtToken = session.token;                
    return session.token;
  }
}
