import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserManagementComponent } from './user-management.component';
import { UserManagementRoutingModule } from './user-management-routing.module';

@NgModule({
  declarations: [UserManagementComponent],
  imports: [
    CommonModule,
    FormsModule,
    UserManagementRoutingModule
  ]
})
export class UserManagementModule { }