import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarNavigationModule } from './../sidebar-navigation/sidebar-navigation.module';
import { SupabaseService } from '../Supabase/supabase.service';
import { DatePipe } from '@angular/common';

interface Attendance {
  id: number;
  name: string;
  status: string;
  schedule_in: string;
  schedule_out: string;
  clock_in: string;
  clock_out: string;
  OT_IN: string;
  OT_OUT: string;
  selected?: boolean;
}

@Component({
  selector: 'app-dtr',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarNavigationModule],
  templateUrl: './dtr.component.html',
  styleUrls: ['./dtr.component.css']
})
export class DtrComponent implements OnInit {
  today: Date = new Date();
  showPopup = false;
  showTable = true;
  isEdit = false;
  isManageMode = false;
  attendances: Attendance[] = [];
  filteredAttendances: Attendance[] = [];
  searchTerm = '';
  message = '';
  isError = false;
  selectedAttendance: Attendance | null = null;
  currentPage = 1;
  itemsPerPage = 8;
  totalPages = 1;

  constructor(private router: Router, private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.loadAttendances();
  }

  async loadAttendances() {
    try {
      this.attendances = await this.supabaseService.getTodayAttendances();
      this.filteredAttendances = this.attendances;
      this.updatePagination();
    } catch (error) {
      console.error('Error loading today\'s attendances:', error);
    }
  }

  applySearch() {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredAttendances = this.attendances.filter(attendance =>
      attendance.name.toLowerCase().includes(term) ||
      attendance.status.toLowerCase().includes(term)
    );
    this.updatePagination();
  }

  formatSchedule(scheduleIn: string, scheduleOut: string): string {
    return `${scheduleIn} - ${scheduleOut}`;
  }

  openPopup() {
    this.isEdit = false;
    this.selectedAttendance = {
      id: 0,
      name: '',
      status: '',
      schedule_in: '',
      schedule_out: '',
      clock_in: '',
      clock_out: '',
      OT_IN: '',
      OT_OUT: ''
    };
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.resetForm();
    this.selectedAttendance = null;
    this.isEdit = false;
  }

  resetForm() {
    this.selectedAttendance = {
      id: 0,
      name: '',
      status: '',
      schedule_in: '',
      schedule_out: '',
      clock_in: '',
      clock_out: '',
      OT_IN: '',
      OT_OUT: ''
    };
  }

  goToAuditTrail() {
    this.router.navigate(['/system-management']);
  }

  closeTable() {
    this.showTable = false;
    this.searchTerm = '';
    this.filteredAttendances = this.attendances;
    this.isManageMode = false;
  }

  showMessage(msg: string, isError: boolean = false) {
    this.message = msg;
    this.isError = isError;
    setTimeout(() => {
      this.message = '';
      this.isError = false;
    }, 3000);
  }

  toggleManageMode() {
    this.isManageMode = !this.isManageMode;
  }

  editAttendance(attendance: Attendance) {
    this.isEdit = true;
    this.selectedAttendance = { ...attendance };
    this.showPopup = true;
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredAttendances.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }
  }

  get paginatedAttendances(): Attendance[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredAttendances.slice(start, end);
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

  async saveOrUpdateAttendance() {
    // Implementation for saving or updating attendance
  }

  async deleteSelectedAttendances() {
    // Implementation for deleting selected attendances
  }

  formatTime(time: string | null): string {
    if (!time) return 'N/A';
    
    const date = new Date(time);
    
    // Convert to UTC+8
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    };
  
    return date.toLocaleString('en-US', options);
  }
}
