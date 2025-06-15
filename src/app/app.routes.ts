// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginPage }      from './auth/login/login.page';
import { RegisterPage }   from './auth/register/register.page';
import { HomePage }       from './home/home.page';
import { MapViewPage }    from './pages/map-view/map-view.page';
import { ProfilePage }    from './pages/profile/profile.component';
import { AuthGuard }      from './guard/auth-guard.guard';

// Ajoutez `export` ici
export const routes: Routes = [
  { path: 'auth/login',    component: LoginPage },
  { path: 'auth/register', component: RegisterPage },
  { path: 'profile',       component: ProfilePage, canActivate: [AuthGuard] },
  { path: 'map',           component: MapViewPage, canActivate: [AuthGuard] },
  { path: 'home',          component: HomePage,    canActivate: [AuthGuard] },
  { path: '',              redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**',            redirectTo: 'map' }
];
