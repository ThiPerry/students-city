// src/app/interceptors/cache.interceptor.ts

import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse
} from '@angular/common/http';
import { from, Observable, of, throwError } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { NetworkService } from './network.service';
import { CacheService }   from '../services/cache.service';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  constructor(
    private network: NetworkService,
    private cache: CacheService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // On ne gère que les GET
    if (req.method !== 'GET') {
      return next.handle(req);
    }

    const cacheKey = req.urlWithParams;

    return this.network.isOnline.pipe(
      switchMap(online => {
        if (!online) {
          // Hors‐ligne → on essaie de retourner le cache
          return from(this.cache.get<any>(cacheKey)).pipe(
            switchMap(cached => {
              if (cached !== null) {
                const response = new HttpResponse({ status: 200, body: cached });
                return of(response);
              }
              // Pas de cache → on échoue
              return throwError(() => new Error('Offline and no cache'));
            })
          );
        }

        // En ligne → on passe la requête et on met en cache la réponse
        return next.handle(req).pipe(
          tap(evt => {
            if (evt instanceof HttpResponse) {
              // Sauvegarde du body dans le cache
              this.cache.set(cacheKey, evt.body).catch(() => {});
            }
          })
        );
      })
    );
  }
}
