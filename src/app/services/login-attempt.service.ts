import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginAttemptService {
  private loginAttempts = 0;
  private maxAttempts = 3;

  incrementLoginAttempts(): void {
    this.loginAttempts++;
  }

  resetLoginAttempts(): void {
    this.loginAttempts = 0;
  }

  isAttemptsExhausted(): boolean {
    return this.loginAttempts >= this.maxAttempts;
  }
}