import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginFailedComponent } from './login-failed/login-failed.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>'
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