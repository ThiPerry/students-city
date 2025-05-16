import { Routes } from '@angular/router';
import { LoginPage } from './auth/login/login.page';
import { RegisterPage } from './auth/register/register.page';
import { HomePage } from './home/home.page';

export const routes: Routes = [
  { path: 'auth/login', component: LoginPage },
  { path: 'auth/register', component: RegisterPage },
  { path: 'home', component: HomePage },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' }
];
