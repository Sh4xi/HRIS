import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarNavigationModule } from './../sidebar-navigation/sidebar-navigation.module';

interface Parameter {
  name: string;
  type: string;
  date?: string;
}

@Component({
  selector: 'app-system-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarNavigationModule],
  templateUrl: './system-management.component.html',
  styleUrl: './system-management.component.css'
})
export class SystemManagementComponent {
  showPopup = false;
  showTable = false;
  showAll = true;
  parameterName: string = '';
  selectedType: string = '';
  types: string[] = ['Holiday', 'OT Type', 'Schedule', 'Leave'];
  holidayDate: string = '';
  parameters: Parameter[] = [];
  hasHolidayParameter: boolean = false;

  constructor(private router: Router) {}

  openPopup() {
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.resetForm();
  }

  saveParameter() {
    const newParameter: Parameter = {
      name: this.parameterName,
      type: this.selectedType,
      date: this.selectedType === 'Holiday' ? this.holidayDate : undefined
    };
    this.parameters.push(newParameter);
    this.hasHolidayParameter = this.parameters.some(p => p.type === 'Holiday');
    this.closePopup();
  }

  resetForm() {
    this.parameterName = '';
    this.selectedType = '';
    this.holidayDate = '';
  }

  goToAuditTrail() {
    this.router.navigate(['/audit-trail']);
  }

  goToDTR() {
    this.router.navigate(['/dtr']);
  }

  openTable() {
    this.showAll = false;
    this.showTable = true;
  }

  closeTable() {
    this.showAll = true;
    this.showTable = false;
  }
}