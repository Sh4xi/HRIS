import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginFailedComponent } from './login-failed/login-failed.component';
import { OtpPopupComponent } from './otp-popup/otp-popup.component';
import { SystemManagementComponent } from './system-management/system-management.component';
import { AuditTrailComponent } from './audit-trail/audit-trail.component';
import { WorkflowComponent } from './workflow-approval/workflow-approval.component';
import { AuthGuard } from './auth/auth.guard';
import { SidebarNavigationComponent } from './sidebar-navigation/sidebar-navigation.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'user-management', component: UserManagementComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'login-failed', component: LoginFailedComponent },
  { path: 'otp-popup', component: OtpPopupComponent },
  { path: 'system-management', component: SystemManagementComponent },
  { path: 'audit-trail', component: AuditTrailComponent },
  { path: 'workflow-approval', component: WorkflowComponent },
  {path: 'sidebar-navigation', component: SidebarNavigationComponent},
  { path: '**', redirectTo: '/login' } // Wildcard route for a 404 page
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

