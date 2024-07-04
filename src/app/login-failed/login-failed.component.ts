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
    name: '',
    email: '',
    concern: ''
  };
  ticketSubmitted = false;
  submitError = '';

  constructor(private ticketService: TicketService) {}

  onSubmit() {
    if (!this.ticket.name || !this.ticket.email || !this.ticket.concern) {
      this.submitError = 'Please fill in all fields.';
      return;
    }

    this.ticketService.submitTicket(this.ticket).subscribe(
      (response: any) => {
        console.log('Ticket submitted successfully:', response);
        this.ticketSubmitted = true;
        this.submitError = '';
      },
      (error: any) => {
        console.error('Error submitting ticket:', error);
        this.submitError = 'An error occurred while submitting the ticket. Please try again.';
      }
    );
  }
}
