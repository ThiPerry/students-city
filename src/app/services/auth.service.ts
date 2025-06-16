import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject, from, throwError, Observable } from 'rxjs';
import { mergeMap, mapTo, catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

import { environment } from 'src/environments/environment';

export interface Session {
  id: number;
  pseudo: string;
  email: string;
  roles: string[];
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<Session|null>(null);
  private jwtToken: string|null = null;

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
      this.jwtToken = session.token;
      this.currentUserSubject.next(session);
    }
  }

  get currentUser(): Observable<Session|null> {
    return this.currentUserSubject.asObservable();
  }

  register(data: { pseudo: string; email: string; password: string }) {
    return this.http
      .post(`${environment.apiUrl}/register`, data)
      .pipe(catchError(err => throwError(() => err)));
  }

  login(email: string, password: string) {
    return this.http
      .post<{ token: string; user: any }>(
        `${environment.apiUrl}/login`,
        { email, password }
      )
      .pipe(
        mergeMap(data => {
          console.log(data.user);
          this.jwtToken = data.token;
          const session: Session = {
            id: data.user.id,
            pseudo: data.user.pseudo,
            email: data.user.email,
            roles: data.user.roles,
            token: data.token
          };
          return from(
            Preferences.set({ key: 'user', value: JSON.stringify(session) })
          ).pipe(mapTo(session));
        }),
        mergeMap(session => {
          this.currentUserSubject.next(session);
          return [session];
        }),
        catchError(err => {
          if (err.status === 401) {
            this.alertCtrl
              .create({
                header: 'Erreur de connexion',
                message: 'Email ou mot de passe incorrect.',
                buttons: ['OK']
              })
              .then(a => a.present());
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
    if (!value) return null;
    const session: Session = JSON.parse(value);
    this.jwtToken = session.token;
    return session.token;
  }

  /** GET /api/profile */
  getProfile(): Observable<Session> {
    return this.http
      .get<{ id: number; pseudo: string; email: string; roles: string[] }>(
        `${environment.apiUrl}/profile`
      )
      .pipe(
        mergeMap(userFromApi =>
          from(this.getToken()).pipe(
            map(token => ({
              id:     userFromApi.id,
              pseudo: userFromApi.pseudo,
              email:  userFromApi.email,
              roles:  userFromApi.roles,
              token:  token!
            }))
          )
        ),
        tap(session => {
          this.jwtToken = session.token;
          this.currentUserSubject.next(session);
          Preferences.set({
            key: 'user',
            value: JSON.stringify(session)
          });
        })
      );
  }

  /** PUT /api/profile */
  updateProfile(data: { pseudo: string; email: string }): Observable<Session> {
    return this.http
      .put<{ pseudo: string; email: string }>(
        `${environment.apiUrl}/profile/me`,
        data
      )
      .pipe(
        mergeMap(updated =>
          from(Preferences.get({ key: 'user' })).pipe(
            mergeMap(({ value }) => {
              if (!value) throw new Error('Aucune session trouvée');
              const session: Session = JSON.parse(value);
              const newSession: Session = {
                ...session,
                pseudo: updated.pseudo,
                email:  updated.email
              };
              return from(
                Preferences.set({ key: 'user', value: JSON.stringify(newSession) })
              ).pipe(mapTo(newSession));
            })
          )
        ),
        mergeMap(newSession => {
          this.currentUserSubject.next(newSession);
          return [newSession];
        }),
        catchError(err => throwError(() => err))
      );
  }
}
