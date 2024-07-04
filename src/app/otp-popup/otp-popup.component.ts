import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-otp-popup',
  templateUrl: './otp-popup.component.html',
  styleUrls: ['./otp-popup.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class OtpPopupComponent {
  otp: string = '';

  resendOtp() {
    // Logic to resend the OTP
    console.log('Resend OTP clicked');
    // Here you might call a service to resend the OTP
    // this.otpService.resendOtp().subscribe(response => {
    //   console.log('OTP resent successfully', response);
    // });
  }

  verifyOtp() {
    // Logic to verify the OTP
    console.log('Verify OTP clicked');
    // console.log('Ticket submitted:', this.otp);
    // Here you might call a service to verify the OTP
    // this.otpService.verifyOtp(this.otp).subscribe(response => {
    //   if (response.valid) {
    //     console.log('OTP verified successfully');
    //   } else {
    //     console.error('Invalid OTP');
    //   }
    // });
  }
}