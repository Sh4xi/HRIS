import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LoginFailedComponent } from './login-failed/login-failed.component';
import { OtpPopupComponent } from './otp-popup/otp-popup.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'login-failed', component: LoginFailedComponent },
  { path: 'otp', component: OtpPopupComponent }
  
];