// src/app/services/network.service.ts

import { Injectable } from '@angular/core';
import { Network }    from '@capacitor/network';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NetworkService {
  private status$ = new BehaviorSubject<boolean>(true);
  public isOnline = this.status$.asObservable();

  constructor() {
    this.init();
  }

  private async init() {
    const info = await Network.getStatus();
    this.status$.next(info.connected);
    Network.addListener('networkStatusChange', stat =>
      this.status$.next(stat.connected)
    );
  }
}
