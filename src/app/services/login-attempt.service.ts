import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginAttemptService {
  private loginAttempts = 0;
  private maxAttempts = 3;

  constructor() { }

  incrementLoginAttempts() {
    this.loginAttempts++;
  }

  shouldRestrictAccount(): boolean {
    return this.loginAttempts >= this.maxAttempts;
  }

  resetLoginAttempts() {
    this.loginAttempts = 0;
  }
}