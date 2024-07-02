import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-failed',
  templateUrl: './login-failed.component.html',
  standalone: true,
  imports: [FormsModule]
})
export class LoginFailedComponent {
  ticket = {
    name: '',
    email: '',
    concern: ''
  };
concern: any;
email: any;
name: any;

  onSubmit() {
    console.log('Ticket submitted:', this.ticket);
    // Here you would typically send the ticket to a server
  }
}