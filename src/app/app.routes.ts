import { Routes } from '@angular/router';
import { LoginPage } from './auth/login/login.page';
import { RegisterPage } from './auth/register/register.page';
import { HomePage } from './home/home.page';
import { MapViewPage} from './pages/map-view/map-view.page';
import { AuthGuard } from './guard/auth-guard.guard';

export const routes: Routes = [
  { path: 'auth/login',component: LoginPage },
  { path: 'auth/register', component: RegisterPage },
  { path: 'map',    canActivate:[AuthGuard], component: MapViewPage },
  { path: 'home',    canActivate:[AuthGuard], component: HomePage },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

];