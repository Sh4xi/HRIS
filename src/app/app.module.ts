import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule
import { UserManagementComponent } from './user-management/user-management.component';


@NgModule({
  declarations: [
    UserManagementComponent
  ],
  imports: [
    BrowserModule,
    FormsModule // <-- Add FormsModule to imports array
  ],
  providers: [],
  bootstrap: [UserManagementComponent]
})
export class AppModule { }
