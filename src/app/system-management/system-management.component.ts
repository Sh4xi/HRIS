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
  searchTerm: string = '';

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

  goToWorkflow() {
    this.router.navigate(['/workflow-approval']);
  }

  goToApproval() {
    this.router.navigate(['/workflow-approval']);
  }
  openTable() {
    this.showTable = true; // Set showTable to true to display the table
    this.filteredParameters = this.parameters; // Ensure filtered parameters are populated
  }

  closeTable() {
    this.showAll = true;
    this.showTable = false;
    this.searchTerm = ''; // Reset search term when closing the table
    // Reset parameters to show all
    this.filteredParameters = this.parameters;
  }

  applySearch() {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredParameters = this.parameters.filter(param =>
      param.name.toLowerCase().includes(term)
    );
  }

  // Array to hold filtered parameters
  filteredParameters: Parameter[] = [];

  // Getter for filtered parameters
  getFilteredParameters(): Parameter[] {
    // If no search term, return all parameters
    if (!this.searchTerm.trim()) {
      return this.parameters;
    }
    // Apply search term filter
    return this.parameters.filter(param =>
      param.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}