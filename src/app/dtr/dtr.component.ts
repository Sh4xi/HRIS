import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarNavigationModule } from './../sidebar-navigation/sidebar-navigation.module';

interface Attendance {
  id?: number;
  employeeName: string;
  status: string;
  schedule: string;
  clockIn: string;
  clockOut: string;
  otIn: string;
  otOut: string;
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

  constructor(private router: Router) {}

  ngOnInit() {
    this.generateMockData();
    this.updatePagination();
  }

  generateMockData() {
    this.attendances = [
      { id: 1, employeeName: 'John Doe', status: 'Present', schedule: '9:00 AM - 5:00 PM', clockIn: '9:00 AM', clockOut: '12:00 PM', otIn: '5:00 PM', otOut: '7:00 PM' },
      { id: 1, employeeName: 'Lean Jedfrey Dedeque', status: 'Late', schedule: '9:00 AM - 5:00 PM', clockIn: '10:00 AM', clockOut: '12:00 PM', otIn: '5:00 PM', otOut: '7:00 PM' },
      { id: 3, employeeName: 'Mark Johnson', status: 'Present', schedule: '9:00 AM - 5:00 PM', clockIn: '8:45 AM', clockOut: '12:15 PM', otIn: '', otOut: '' },
      { id: 4, employeeName: 'Emily Davis', status: 'Late', schedule: '9:00 AM - 5:00 PM', clockIn: '9:15 AM', clockOut: '12:00 PM', otIn: '', otOut: '' },
      { id: 5, employeeName: 'Michael Brown', status: 'Present', schedule: '9:00 AM - 5:00 PM', clockIn: '9:00 AM', clockOut: '12:00 PM', otIn: '5:00 PM', otOut: '6:00 PM' },
      { id: 6, employeeName: 'Sarah Wilson', status: 'Absent', schedule: '9:00 AM - 5:00 PM', clockIn: '', clockOut: '', otIn: '', otOut: '' },
      { id: 7, employeeName: 'David Martinez', status: 'Present', schedule: '9:00 AM - 5:00 PM', clockIn: '9:05 AM', clockOut: '12:05 PM', otIn: '', otOut: '' },
      { id: 8, employeeName: 'Laura Garcia', status: 'Present', schedule: '9:00 AM - 5:00 PM', clockIn: '9:00 AM', clockOut: '12:00 PM', otIn: '5:00 PM', otOut: '7:00 PM' },
      { id: 9, employeeName: 'Chris Lee', status: 'Late', schedule: '9:00 AM - 5:00 PM', clockIn: '9:20 AM', clockOut: '12:00 PM', otIn: '', otOut: '' },
      { id: 10, employeeName: 'Anna Harris', status: 'Present', schedule: '9:00 AM - 5:00 PM', clockIn: '9:00 AM', clockOut: '12:00 PM', otIn: '5:00 PM', otOut: '6:00 PM' },
    ];
    this.filteredAttendances = [...this.attendances];
    this.updatePagination();
  }

  openPopup() {
    this.isEdit = false;
    this.selectedAttendance = {
      employeeName: '',
      status: '',
      schedule: '',
      clockIn: '',
      clockOut: '',
      otIn: '',
      otOut: ''
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
      employeeName: '',
      status: '',
      schedule: '',
      clockIn: '',
      clockOut: '',
      otIn: '',
      otOut: ''
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

  applySearch() {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredAttendances = this.attendances.filter(attendance =>
      attendance.employeeName.toLowerCase().includes(term)
    );
    this.updatePagination();
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
    // Logic to save or update attendance
  }

  async deleteSelectedAttendances() {
    // Logic to delete selected attendances
  }
}
