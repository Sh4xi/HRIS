import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TicketService } from './ticket.service';

@Component({
  selector: 'app-login-failed',
  templateUrl: './login-failed.component.html',
  styleUrls: ['./login-failed.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  providers: [TicketService]
})
export class LoginFailedComponent {
  ticket = {
    title: 'Login Failed',
    email: '',
    description: ''
  };
  ticketSubmitted = false;
  submitError = '';

  constructor(private ticketService: TicketService) {}

  onSubmit() {
    if (!this.ticket.email.trim() || !this.ticket.title.trim() || !this.ticket.description.trim()) {
      this.submitError = 'Please fill in all fields.';
      return;
    }

    this.ticketService.submitTicket(this.ticket).subscribe(
      response => {
        console.log('Ticket submitted successfully:', response);
        this.ticketSubmitted = true;
        this.submitError = '';
        this.resetForm();
      },
      error => {
        console.error('Error submitting ticket:', error);
        this.submitError = 'An error occurred while submitting the ticket. Please try again.';
      }
    );
  }

  resetForm() {
    this.ticket = {
      title: 'Login Failed',
      email: '',
      description: ''
    };
  }

  createLoginFailedTicket(email: string) {
    this.ticket.email = email;
    this.ticket.description = `User with email ${email} failed to login.`;
    this.onSubmit();
  }
}