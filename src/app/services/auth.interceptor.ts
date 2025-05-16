// src/app/services/auth.interceptor.ts

import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler,
  HttpRequest, HttpErrorResponse
} from '@angular/common/http';
import { from, Observable, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const url = req.url.startsWith('http')
      ? req.url
      : `${environment.apiUrl}${req.url}`;

    return from(this.auth.getToken()).pipe(
      switchMap(token => {
        let authReq = req.clone({ url });
        if (token) {
          authReq = authReq.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
          });
        }
        return next.handle(authReq).pipe(
          catchError((err: HttpErrorResponse) => {
            if (err.status === 401) {
              this.auth.logout();
            }
            return throwError(() => err);
          })
        );
      })
    );
  }
}
