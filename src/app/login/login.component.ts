import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../Supabase/supabase.service';
import { LoginAttemptService } from '../services/login-attempt.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private supabaseService: SupabaseService,
    public loginAttemptService: LoginAttemptService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.loginAttemptService.isAttemptsExhausted()) {
      this.router.navigate(['/login-failed']);
      return;
    }

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

  async authenticateUser(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const success = await this.supabaseService.signIn(this.email, this.password);

      this.isLoading = false;

      if (!success) {
        this.handleLoginFailure('Invalid email or password. Please try again.');
      } else {
        console.log('User authenticated!');
        this.errorMessage = '';
        this.loginAttemptService.resetLoginAttempts();
        this.router.navigate(['/dashboard']); // Redirect to the dashboard
      }
    } catch (error) {
      this.isLoading = false;
      console.error('Error:', error);
      this.handleLoginFailure('An error occurred. Please try again later.');
    }
  }

  handleLoginFailure(message: string): void {
    this.errorMessage = message;
  }

  submitTicket() {
    // Implement the logic to navigate to the ticket submission page
    // For example, you could use Angular's Router to navigate to a specific route
    this.router.navigate(['/submit-ticket']);
  }
}