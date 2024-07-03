import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginAttemptService } from '../services/login-attempt.service';
import { LoginFailedComponent } from '../login-failed/login-failed.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, LoginFailedComponent]
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  email: string = '';

  constructor(public loginAttemptService: LoginAttemptService) {}

  onSubmit(): void {
    // Your login logic here
    this.loginAttemptService.incrementLoginAttempts();
  }
}