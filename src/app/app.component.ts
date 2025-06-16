import { Component, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { OfflineBannerComponent } from './components/offline-banner.component'

interface AppPage {
  title: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    OfflineBannerComponent,
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule 
  ],
})
export class AppComponent {
  public appPages: AppPage[] = [
    { title: 'Carte',  url: '/map',    icon: 'map'    },
    { title: 'Profil', url: '/profile',icon: 'person' },
    { title: 'Lieux',   url: '/places', icon: 'list'   }

  ];

  constructor(private auth: AuthService) {}

  logout() {
    this.auth.logout();
  }
}
