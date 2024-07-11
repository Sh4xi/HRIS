import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarNavigationModule } from './../sidebar-navigation/sidebar-navigation.module';

interface Parameter {
  name: string;
  type: string;
  date?: string;
  startTime?: string;
  endTime?: string;
}

@Component({
  selector: 'app-system-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarNavigationModule],
  templateUrl: './system-management.component.html',
  styleUrls: ['./system-management.component.css']
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
  scheduleStartTime: string = '';
  scheduleEndTime: string = '';

  // Define auditTrailData property
  auditTrailData: Parameter[] = [];

  constructor(private router: Router) {}

  get hasHolidayParameter(): boolean {
    return this.parameters.some(p => p.type === 'Holiday');
  }

  get hasScheduleParameter(): boolean {
    return this.parameters.some(p => p.type === 'Schedule');
  }

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
      type: this.selectedType
    };

    if (this.selectedType === 'Holiday') {
      newParameter.date = this.holidayDate;
    } else if (this.selectedType === 'Schedule') {
      newParameter.startTime = this.scheduleStartTime;
      newParameter.endTime = this.scheduleEndTime;
    }

    this.parameters.push(newParameter);
    console.log('New parameter saved:', newParameter);
    console.log('Current parameters:', this.parameters);
    this.closePopup();
  }

  resetForm() {
    this.parameterName = '';
    this.selectedType = '';
    this.holidayDate = '';
    this.scheduleStartTime = '';
    this.scheduleEndTime = '';
  }

  goToAuditTrail() {
    this.router.navigate(['/audit-trail']);
  }

  goToDTR() {
    this.router.navigate(['/dtr']);
  }

  openTable() {
    // Populate auditTrailData with existing parameters
    this.auditTrailData = [...this.parameters];
    console.log('Audit Trail Data:', this.auditTrailData);
    this.showAll = false;
    this.showTable = true;
  }

  closeTable() {
    this.showAll = true;
    this.showTable = false;
  }
}
