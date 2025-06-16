// src/app/components/offline-banner/offline-banner.component.ts

import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule }    from '@angular/common';
import { IonicModule }     from '@ionic/angular';
import { NetworkService }  from '../services/network.service';

@Component({
  selector: 'offline-banner',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <ion-banner
      *ngIf="!(networkService.isOnline | async)"
      color="warning"
      mode="ios"
      class="offline-banner"
    >
      <ion-icon slot="start" name="alert-circle-outline"></ion-icon>
      Vous êtes hors-ligne. Les données peuvent être obsolètes.
    </ion-banner>
  `,
  styles: [`
    .offline-banner {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 9999;
      --padding-top:    12px;
      --padding-bottom: 12px;
    }

    ion-content {
      --padding-top: 48px;
    }
  `]
})
export class OfflineBannerComponent {
  constructor(public networkService: NetworkService) {}
}
