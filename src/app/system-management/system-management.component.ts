import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-system-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './system-management.component.html',
  styleUrl: './system-management.component.css'
})
export class SystemManagementComponent {
  showPopup = false;
  parameterName: string = '';
  selectedType: string = '';
  types: string[] = ['Holiday', 'OT Type', 'Schedule', 'Leave'];
  holidayDate: string = ''; // New property for holiday date

  openPopup() {
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.resetForm();
  }

  saveParameter() {
    console.log('Saving parameter:', this.parameterName, this.selectedType);
    if (this.selectedType === 'Holiday') {
      console.log('Holiday date:', this.holidayDate);
    }
    this.closePopup();
  }

  resetForm() {
    this.parameterName = '';
    this.selectedType = '';
    this.holidayDate = '';
  }
}