import { Routes } from '@angular/router';
import { LoginComponent } from '../app/login/login.component';
import { LoginFailedComponent } from '../app/login-failed/login-failed.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'login-failed', component: LoginFailedComponent }
];