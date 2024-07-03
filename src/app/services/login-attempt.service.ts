import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginAttemptService {
  private loginAttempts: number = 0;

  incrementLoginAttempts(): void {
    this.loginAttempts++;
    console.log(`Login attempts: ${this.loginAttempts}`);
  }

  getLoginAttempts(): number {
    return this.loginAttempts;
  }
}