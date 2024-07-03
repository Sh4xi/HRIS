import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-failed',
  templateUrl: './login-failed.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class LoginFailedComponent {
  ticket = {
    name: '',
    email: '',
    concern: ''
  };

  ticketSubmitted = false;

  onSubmit() {
    console.log('Ticket submitted:', this.ticket);
    // Here you would typically send the ticket to a server
    // For now, we'll just set a flag to indicate submission
    this.ticketSubmitted = true;
  }
}