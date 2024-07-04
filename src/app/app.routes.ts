import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginFailedComponent } from './login-failed/login-failed.component';
import { OtpPopupComponent } from './otp-popup/otp-popup.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  { path: '', redirectTo: '/user-management', pathMatch: 'full'  },
  { path: 'user-management', component: UserManagementComponent },
  
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },

  { path: '', redirectTo: '/login-failed', pathMatch: 'full' },
  { path: 'login-failed', component: LoginFailedComponent },

  { path: '', redirectTo: '/otp-popup', pathMatch: 'full' },
  { path: 'otp-popup', component: OtpPopupComponent },
];