import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginFailedComponent } from './login-failed/login-failed.component';
import { OtpPopupComponent } from './otp-popup/otp-popup.component';
import { AuditTrailComponent } from './audit-trail/audit-trail.component';
import { AuthGuard } from './auth/auth.guard'; // Assuming you have an AuthGuard

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'user-management', 
    component: UserManagementComponent, 
    canActivate: [AuthGuard] 
  },
  { path: 'login-failed', component: LoginFailedComponent },
  { path: 'otp-popup', component: OtpPopupComponent },
  { 
    path: 'audit-trail', 
    component: AuditTrailComponent, 
    canActivate: [AuthGuard] 
  },
  // wildcard
  { path: '**', redirectTo: '/login' }
];