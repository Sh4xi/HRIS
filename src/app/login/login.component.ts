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
  email: string = '';
  password: string = '';
  logins: any[] = [];
  errorMessage: string = '';
  isLoading: boolean = false;  // Add this line

  constructor(
    public loginAttemptService: LoginAttemptService,
    private http: HttpClient
  ) {}

  onSubmit(): void {
    if (this.validateForm()) {
      this.loginAttemptService.incrementLoginAttempts();
      this.authenticateUser();
    }
  }

  validateForm(): boolean {
    if (!this.email) {
      this.errorMessage = 'Email is required.';
      return false;
    }
    if (!this.isValidEmail(this.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return false;
    }
    if (!this.password) {
      this.errorMessage = 'Password is required.';
      return false;
    }
    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  authenticateUser(): void {
    this.isLoading = true;
    this.errorMessage = '';

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
          this.isLoading = false;
          if (response.access_token) {
            console.log('User authenticated!');
            this.errorMessage = '';
            // Here you should redirect the user or set some auth state
            // For example:
            // this.router.navigate(['/dashboard']);
          } else {
            console.error('Invalid credentials');
            this.errorMessage = 'Invalid email or password. Please try again.';
          }
        },
        (error: any) => {
          this.isLoading = false;
          console.error('Error:', error);
          if (error.status === 400) {
            this.errorMessage = 'Invalid email or password. Please try again.';
          } else {
            this.errorMessage = 'An error occurred. Please try again later.';
          }
        }
      );
  }
}