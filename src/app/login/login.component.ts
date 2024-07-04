import { Component } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginAttemptService } from '../services/login-attempt.service';
import { LoginFailedComponent } from '../login-failed/login-failed.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, LoginFailedComponent]
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  email: string = '';
  logins: any[] = [];
  errorMessage: string = ''; // Add this line

  constructor(
    public loginAttemptService: LoginAttemptService,
    private http: HttpClient
  ) {}

  onSubmit(): void {
    this.loginAttemptService.incrementLoginAttempts();
    this.authenticateUser();
  }

  authenticateUser(): void {
    const supabaseUrl = 'https://vhmftufkipgbxmcimeuq.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZobWZ0dWZraXBnYnhtY2ltZXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk5MDExODAsImV4cCI6MjAzNTQ3NzE4MH0.7bzTx5n4SpXA1Go9kCRfgsxUIpK8j68vM-hIpVKJcnw';

    const headers = new HttpHeaders({
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    });

    const credentials = {
      email: this.email,
      password: this.password
    };

    this.http.post(`${supabaseUrl}/auth/v1/token?grant_type=password`, credentials, { headers })
      .subscribe(
        (response: any) => {
          if (response.access_token) {
            console.log('User authenticated!');
            this.errorMessage = ''; // Clear any existing error message
          } else {
            console.error('Invalid credentials');
            this.errorMessage = 'Incorrect password. Try again.';
          }
        },
        (error: any) => {
          console.error(error);
          this.errorMessage = 'Incorrect password. Try again.';
        }
      );
  }
}