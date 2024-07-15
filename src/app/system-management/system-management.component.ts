import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarNavigationModule } from './../sidebar-navigation/sidebar-navigation.module';
import { SupabaseService } from '../Supabase/supabase.service';

interface Parameter {
  id?: number; // Add this line
  parameter_name: string;
  parameter_type: string;
  parameter_date?: string | null;
  parameter_time?: string | null;
  parameter_time2?: string | null;
  selected?: boolean;
}

@Component({
  selector: 'app-system-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarNavigationModule],
  templateUrl: './system-management.component.html',
  styleUrls: ['./system-management.component.css']
})
export class SystemManagementComponent implements OnInit {
  showPopup = false;
  showTable = false;
  showAll = true;
  isEdit = false;
  isManageMode: boolean = false;
  parameterName: string = '';
  selectedType: string = '';
  types: string[] = ['Holiday', 'OT Type', 'Schedule', 'Leave'];
  holidayDate: string = '';
  parameters: Parameter[] = [];
  scheduleStartTime: string = '';
  scheduleEndTime: string = '';
  searchTerm: string = '';
  filteredParameters: Parameter[] = [];
  message: string = '';
  isError: boolean = false;
  selectedParameter: Parameter | null = null;
  // Pagination variables
  currentPage = 1;
  itemsPerPage = 8; // Adjust the number of items per page as needed
  totalPages = 1;

  constructor(private router: Router, private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.loadParameters();
  }

  get hasHolidayParameter(): boolean {
    return this.parameters.some(p => p.parameter_type === 'Holiday');
  }

  get hasScheduleParameter(): boolean {
    return this.parameters.some(p => p.parameter_type === 'Schedule');
  }

  openPopup() {
    this.isEdit = false;
    this.selectedParameter = {
      parameter_name: '',
      parameter_type: this.types[0],
      parameter_date: null,
      parameter_time: null,
      parameter_time2: null
    };
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.resetForm();
    this.selectedParameter = null;
    this.isEdit = false;
  }

  resetForm() {
    this.parameterName = '';
    this.selectedType = '';
    this.holidayDate = '';
    this.scheduleStartTime = '';
    this.scheduleEndTime = '';
    this.selectedParameter = {
      parameter_name: '',
      parameter_type: '',
      parameter_date: null,
      parameter_time: null,
      parameter_time2: null
    };
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
    this.showTable = true;
    this.loadParameters(); // Make sure to load parameters when opening the table
  }

  closeTable() {
    this.showAll = true;
    this.showTable = false;
    this.searchTerm = '';
    this.filteredParameters = this.parameters;
    this.isManageMode = false;
  }

  applySearch() {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredParameters = this.parameters.filter(param =>
      param.parameter_name.toLowerCase().includes(term)
    );
    this.updatePagination();
  }

  getFilteredParameters(): Parameter[] {
    if (!this.searchTerm.trim()) {
      return this.parameters;
    }
    return this.parameters.filter(param =>
      param.parameter_name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  showMessage(msg: string, isError: boolean = false) {
    this.message = msg;
    this.isError = isError;
    setTimeout(() => {
      this.message = '';
      this.isError = false;
    }, 3000);
  }

  async loadParameters() {
    try {
      const data = await this.supabaseService.getParameters();
      console.log('Loaded parameters:', data);
      this.parameters = data;
      this.filteredParameters = data;
      this.updatePagination();
      this.selectedParameter = null; // Reset selected parameter
    } catch (error) {
      console.error('Error loading parameters:', error);
      this.showMessage('Failed to load parameters', true);
    }
  }

  async saveParameter() {
    const newParameter: Parameter = {
      parameter_name: this.parameterName,
      parameter_type: this.selectedType,
      parameter_date: this.selectedType === 'Holiday' ? this.holidayDate : null,
      parameter_time: this.selectedType === 'Schedule' ? this.scheduleStartTime : null,
      parameter_time2: this.selectedType === 'Schedule' ? this.scheduleEndTime : null
    };

    try {
      await this.supabaseService.createParameter(newParameter);
      await this.loadParameters();
      this.closePopup();
      this.showMessage('Parameter saved successfully');
    } catch (error) {
      console.error('Error saving parameter:', error);
      this.showMessage('Failed to save parameter', true);
    }
  }

  toggleManageMode() {
    this.isManageMode = !this.isManageMode;
  }

  // editParameter(parameter: Parameter) {
  //   this.isEdit = true;
  //   this.selectedParameter = { ...parameter };
  //   this.parameterName = parameter.parameter_name;
  //   this.selectedType = parameter.parameter_type;
  //   this.holidayDate = parameter.parameter_date || '';
  //   this.scheduleStartTime = parameter.parameter_time || '';
  //   this.scheduleEndTime = parameter.parameter_time2 || '';
  //   this.showPopup = true;
    
  // }

  editParameter(parameter: Parameter) {
    this.isEdit = true;
    this.selectedParameter = { ...parameter };
    this.showPopup = true;
  }


  async deleteSelectedParameters() {
    try {
      const selectedParams = this.filteredParameters.filter(param => param.selected);
      const deletions = selectedParams.map(param =>
        this.supabaseService.deleteParameter(param.parameter_name)
      );
      await Promise.all(deletions);
      await this.loadParameters(); // Reload parameters after deletion
      this.showMessage('Parameters deleted successfully');
    } catch (error) {
      console.error('Error deleting parameters:', error);
      this.showMessage('Failed to delete parameters', true);
    }
  }
  

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredParameters.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }
  }

  get paginatedParameters(): Parameter[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredParameters.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  // Function to update parameter
  async updateParameter(updatedParameter: any) {
    try {
      const response = await this.supabaseService.updateParameter(updatedParameter);
      console.log('Update response:', response);
      // Optionally, update the local parameter list or reload data
      // Reload data example: await this.loadParameters();
      this.closePopup();
    } catch (error) {
      console.error('Error updating parameter:', error);
    }
  }


  async saveOrUpdateParameter() {
    try {
      if (!this.selectedParameter) {
        throw new Error('No parameter selected');
      }
  
      if (this.isEdit) {
        // Updating existing parameter
        await this.supabaseService.updateParameter(this.selectedParameter);
        this.showMessage('Parameter updated successfully');
      } else {
        // Creating new parameter
        await this.supabaseService.createParameter(this.selectedParameter);
        this.showMessage('Parameter saved successfully');
      }
      await this.loadParameters();
      this.closePopup();
    } catch (error) {
      console.error('Error saving/updating parameter:', error);
      this.showMessage('Failed to save/update parameter', true);
    }
  }
}
