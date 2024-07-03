import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule
import { UserManagementComponent } from './user-management/user-management.component';
import { LoginFailedComponent } from './login-failed/login-failed.component';
import { OtpPopupComponent } from './otp-popup/otp-popup.component';


@NgModule({
  declarations: [
    UserManagementComponent,
    LoginFailedComponent,
    OtpPopupComponent
  ],
  imports: [
    BrowserModule,
    FormsModule // <-- Add FormsModule to imports array
  ],
  providers: [],
  bootstrap: [UserManagementComponent, LoginFailedComponent, OtpPopupComponent]
})
export class AppModule { }
