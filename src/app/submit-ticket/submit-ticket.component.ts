import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TicketService } from './submit-ticket.service';

@Component({
  selector: 'app-submit-ticket',
  templateUrl: './submit-ticket.component.html',
  styleUrls: ['./submit-ticket.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class SubmitTicketComponent {
  ticket = {
    title: 'Submit Ticket',
    email: '',
    description: ''
  };
  ticketSubmitted = false;
  submitError = '';

  @Output() close = new EventEmitter<void>();

  closePopup() {
    this.close.emit();
  }


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
      title: 'Submit Ticket',
      email: '',
      description: ''
    };
  }

  createLoginFailedTicket(email: string) {
    this.ticket = {
      title: 'Login Failed',
      email: email,
      description: `User with email ${email} failed to login.`
    };
    this.onSubmit();
  }
}