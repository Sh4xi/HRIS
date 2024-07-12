import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginFailedComponent } from './login-failed/login-failed.component';
import { OtpPopupComponent } from './otp-popup/otp-popup.component';
import { AuditTrailComponent } from './audit-trail/audit-trail.component';
import { SystemManagementComponent } from './system-management/system-management.component';
import { DtrComponent } from './dtr/dtr.component';
import { WorkflowComponent } from './workflow-approval/workflow-approval.component';
import { WorkflowApprovalUserComponent } from './workflow-approval-user/workflow-approval-user.component';
import { authGuard } from './auth/auth.guard'; // Adjust the path if necessary

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'user-management', component: UserManagementComponent, canActivate: [authGuard] },
  { path: 'login-failed', component: LoginFailedComponent },
  { path: 'otp-popup', component: OtpPopupComponent },
  { path: 'system-management', component: SystemManagementComponent, canActivate: [authGuard] },
  { path: 'dtr', component: DtrComponent, canActivate: [authGuard] },
  { path: 'audit-trail', component: AuditTrailComponent, canActivate: [authGuard] },
  { path: 'workflow-approval', component: WorkflowComponent, canActivate: [authGuard] },
  { path: 'workflow-approval-user', component: WorkflowApprovalUserComponent, canActivate: [authGuard] },
];