import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginRoutingModule } from './login-routing.module';
import { LoginAttemptService } from '../services/login-attempt.service';
import { LoginComponent } from './login.component';

@NgModule({
  imports: [
    CommonModule,
    LoginRoutingModule,
    LoginComponent  // This is correct for a standalone component
  ],
  providers: [LoginAttemptService]
})
export class LoginModule { }