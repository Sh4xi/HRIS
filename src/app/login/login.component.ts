import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
    username: string = '';
    password: string = '';
    showPassword: boolean = false;
    passwordError: boolean = false; // Flag to show/hide password error message
  
    // Function to toggle password visibility
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    }
  
    // Function to handle form submission
    submitForm() {
      // Simulate checking password validity (replace with actual logic)
      if (this.password !== 'correctpassword') {
        this.passwordError = true;
      } else {
        // Clear error and proceed with login logic
        this.passwordError = false;
        // Replace with actual login logic (e.g., navigate to dashboard)
        console.log('Logged in successfully');
      }
    }
  }