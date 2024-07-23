import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  getUser() {
    throw new Error('Method not implemented.');
  }
  login(username: string, password: string): boolean {
    // Implement your authentication logic here
    if (username === 'admin' && password === 'password') {
      localStorage.setItem('token', 'your-auth-token');
      return true;
    }
    return false;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}


