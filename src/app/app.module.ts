import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, Injectable, NgModule } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { LoginFailedComponent } from '../app/login-failed/login-failed.component';
import { AuditTrailComponent } from './audit-trail/audit-trail.component';

@NgModule({
  imports: [
    HttpClientModule,
    RouterOutlet,
    CommonModule,
    DashboardComponent,
    UserManagementComponent,
    LoginFailedComponent,
    AuditTrailComponent
  ],
})
export class AppModule { }

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http: HttpClient) { }

  getBackendData() {
    this.http.get('http://your-backend-url/api/data')
     .subscribe(
        (response: any) => {
          console.log(response);
        },
        (error: any) => {
          console.error(error);
        }
      );
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'HRIS_login-page';
  passwordHidden: boolean = true;

  togglePasswordVisibility(): void {
    this.passwordHidden = !this.passwordHidden;
    const passwordField = document.getElementById('password') as HTMLInputElement;
    passwordField.type = this.passwordHidden ? 'password' : 'text';
  }
}