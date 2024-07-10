import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../Supabase/supabase.service';

interface AccessRights {
  [key: string]: boolean;
}

interface User {
  profile: string;
  name: string;
  email: string;
  password: string;
  department: string;
  position: string;
  type: string;
  status: string;
  access: boolean;
  selected?: boolean;
}

interface Employee {
  email: string;
  firstName: string;
  middleName: string;
  surname: string;
  position: string;
  department: string;
  type: string;
}

interface Ticket {
  id: number;
  title: string;
  email: string;
  description: string;
  status: string;
  dateTime: Date;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  // Functions for users tab
  users: User[] = [];
  filteredUsers: User[] = [];
  paginatedUsers: User[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  activeTab: string = 'users';
  showManagePopup = false;
  showAddPopup = false;
  showEditPopup = false;

  showAccessRightsPopup = false;
  showAddDepartmentPopup = false;
  isEditing: boolean = false;
  showModal = false;
  photoPreviewUrl = 'https://via.placeholder.com/200x200';
  showPasswordGeneratedMessage: boolean = false;
  newRole = '';
  newDepartment = '';
  departmentType = 'all';
  selectedDepartments: string[] = [];
  departments = ['HR', 'IT', 'Finance', 'Marketing'];

  showPhotoMessage = true; // Property to control the visibility of the message
  showFileTypeAlert = false;
  showFileSizeAlert = false;

  // Functions for Support tickets tab
  paginatedTickets: Ticket[] = [];
  searchTicketTerm: string  = '';
  ticket_currentPage: number = 1;
  ticket_itemsPerPage: number = 10;

  filteredTickets: Ticket[] = [];
  selectedTickets: boolean[] = [];
  filterOption: string = 'all'; // Default filter option

  selectedTicket: any = null;
  isModalVisible = false;
  showTicketModal = false;

  employee = {
    email: '',
    password: '',
    firstname: '',
    midname: '',
    surname: '',
    position: '',
    department: '',
    type: ''
  };

  modules = [
    'Personnel Information Management',
    'Payroll Management',
    'Employee Information Management',
    'Time & Attendance Management',
    'Online Job Application Portal',
    'Recruitment, Selection and Placement',
    'Learning and Development (L&D)',
    'Rewards and Recognition',
    'Performance Management',
    'Health and Wellness',
    'Forms and Workflow',
    'Reports',
    'Data Exchange (Export and Import)',
    'Data Visualization'
  ];

  reports = [
    'Employee Performance Reports',
    'Payroll Summaries',
    'Recruitment Reports',
    'Training Reports',
    'No Access'
  ];

  dataAccess = [
    'Employee Records',
    'Financial Data',
    'Attendance Records',
    'Job Applications',
    'Training Data',
    'No Access'
  ];

  // Mockdata for Tickets
  tickets: Ticket[] = [
    { id: 1, title: 'Issue with login', email: 'user1@example.com', description: 'Cannot login to the system', status: 'read', dateTime: new Date('2024-07-11T10:30:00') },
    { id: 2, title: 'Page not loading', email: 'user1@example.com', description: 'Homepage takes too long to load', status: 'unread', dateTime: new Date('2024-07-11T10:30:00') },
    { id: 3, title: 'Error 404', email: 'user1@example.com', description: 'Page not found error when navigating to profile', status: 'read', dateTime: new Date('2024-07-11T10:30:00') },
    { id: 4, title: 'Feature request', email: 'user2@example.com', description: 'Request for a new feature in the system', status: 'read', dateTime: new Date('2024-07-11T10:30:00') },
    { id: 5, title: 'Bug in form submission', email: 'user2@example.com', description: 'Form does not submit properly', status: 'unread', dateTime: new Date('2024-07-11T10:30:00')},
    { id: 6, title: 'Crash on startup', email: 'user3@example.com', description: 'Application crashes on startup', status: 'unread', dateTime: new Date('2024-07-11T10:30:00')},
    { id: 7, title: 'Performance issue', email: 'user4@example.com', description: 'System performance is slow', status: 'read', dateTime: new Date('2024-07-11T10:30:00')},
    { id: 8, title: 'UI glitch', email: 'user5@example.com', description: 'Minor UI glitch in dashboard', status: 'unread', dateTime: new Date('2024-07-11T10:30:00')},
    { id: 9, title: 'Security vulnerability', email: 'user6@example.com', description: 'Potential security vulnerability reported', status: 'read', dateTime: new Date('2024-07-11T10:30:00')},
    { id: 10, title: 'Database error', email: 'user7@example.com', description: 'Error connecting to database', status: 'unread', dateTime: new Date('2024-07-11T10:30:00')},
  ];

  privileges = ['View', 'Edit', 'Delete', 'Approve'];

  selectedModules: string[] = [];
  selectedReports: string[] = [];
  selectedDataAccess: string[] = [];
  selectedPrivileges: string[] = [];

  departmentAccessRights = [
    'View Department Data',
    'Edit Department Data',
    'Manage Department Members',
    'Approve Department Requests'
  ];

  departmentAccess: AccessRights = {};

  constructor(private supabaseService: SupabaseService) {}
  
  toggleModal() {
    this.showModal = !this.showModal;
    if (this.showModal) {
      this.generateRandomPassword();
    } else {
      this.resetForm();
    }
  }

  generateRandomPassword(length: number = 8) {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const allChars = lowercase + uppercase + numbers + symbols;

    let password = '';
    
    // Ensure at least one character from each type
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest of the password
    for (let i = password.length; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * allChars.length);
      password += allChars[randomIndex];
    }

    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');

    this.employee.password = password;
    
    // Provide visual feedback
    this.showPasswordGeneratedMessage = true;
    setTimeout(() => this.showPasswordGeneratedMessage = false, 3000);
  }

  onPhotoChange(event: any) {
    const file = event.target.files[0];
    const maxSizeInBytes = 2 * 1024 * 1024; // 2MB

    // Reset alerts
    this.showFileTypeAlert = false;
    this.showFileSizeAlert = false;

    if (file) {
      if (file.size > maxSizeInBytes) {
        this.showFileSizeAlert = true;
        event.target.value = ''; // Clear the file input
        return;
      }

      if (file.type !== 'image/png') {
        this.showFileTypeAlert = true;
        event.target.value = ''; // Clear the file input
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreviewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

async onSubmit() {
    if (this.isEditing) {
      console.log('Updating employee:', this.employee);
      const response = await this.supabaseService.updateEmployee(this.employee);
      if (response.error) {
        console.error('Error updating employee:', response.error.message);
      } else {
        console.log('Employee updated successfully:', response.data);
        this.toggleModal();
        this.resetForm();
        this.loadEmployees();
      }
    } else {
      const emailExists = await this.supabaseService.checkEmailExists(this.employee.email);
      if (emailExists) {
        console.error('Email already exists. Please use a different email.');
        alert('Email already exists. Please use a different email.');
        return;
      }

      console.log('Creating employee:', this.employee);
      const response = await this.supabaseService.createEmployee(this.employee);
      if (response.error) {
        console.error('Error creating employee:', response.error.message);
      } else {
        console.log('Employee created successfully:', response.data);
        this.toggleModal();
        this.resetForm();
        this.loadEmployees();
      }
    }
  }

  addRole() {
    if (!this.newRole) {
      alert('Please enter a role name');
      return;
    }
  
    if (this.departmentType === 'specific' && !this.selectedDepartments) {
      alert('Please select a department');
      return;
    }
  
    const roleData = {
      role_name: this.newRole,
      mod_access: this.selectedModules.length > 0 ? this.selectedModules : [],
      rep_access: this.selectedReports.length > 0 ? this.selectedReports : [],
      data_access: this.selectedDataAccess.length > 0 ? this.selectedDataAccess : [],
      privileges: this.selectedPrivileges.length > 0 ? this.selectedPrivileges : [],
      department: this.departmentType === 'all'
        ? ['All Departments']
        : this.departmentType === 'specific'
        ? this.selectedDepartments
        : this.selectedDepartments.length > 0
        ? this.selectedDepartments
        : []
    };
  
    this.supabaseService.createRole(roleData)
    .then(response => {
      if (response.error) {
        console.error('Error creating role:', response.error.message);
      } else {
        if (response.data) {
          console.log('Role created successfully:', response.data);
        } else {
          console.log('Role created successfully, but no data returned.');
        }
        this.closeAddPopup();
      }
    });
  }
  

  toggleUserSelection(user: User) {
    user.selected = !user.selected;
  }

  getSelectedUsers(): User[] {
    return this.users.filter(user => user.selected);
  }

  async updateEmployee(employee: any,) { // updateEmployee(employee: any, index: number) {
    const updatedUser: Partial<User> = {
      profile: this.photoPreviewUrl,
      name: `${employee.firstname} ${employee.midname ? employee.midname + ' ' : ''}${employee.surname}`,
      email: employee.email,
      password: employee.password,
      department: employee.department,
      position: employee.position,
      type: employee.type,
      status: 'Active',
      access: true

    };
  
    // Update user locally
    const index = this.users.findIndex(user => user.email === employee.email);
    if (index !== -1) {
      this.users[index] = updatedUser as User;
    }
    this.filteredUsers = this.users;
    this.updatePagination();
  
    // Update user in the database
    const { data, error } = await this.supabaseService.updateEmployee(employee);
    if (error) {
      console.error('Error updating employee:', error.message);
    } else {
      console.log('Employee updated successfully:', data);
      this.toggleModal();
      this.resetForm();
      this.loadEmployees(); //added feature
    }
  }
  
  resetForm() {
    this.employee = {
      email: '',
      password: '',
      firstname: '',
      midname: '',
      surname: '',
      position: '',
      department: '',
      type: ''
    };
    this.photoPreviewUrl = 'https://via.placeholder.com/200x200';
  }

  isFormValid(): boolean {
    return !!(this.employee.email && this.employee.firstname && this.employee.surname &&
              this.employee.position && this.employee.department && this.employee.type);
  }

  async createEmployee(employee: any) {
  const newUser = {
    email: employee.email,
    first_name: employee.firstname,
    mid_name: employee.midname,
    surname: employee.surname,
    password: this.generateRandomPassword(8), // Use the generated password //edited
    department: employee.department,
    position: employee.position,
    types: employee.type
  };

  const { data, error } = await this.supabaseService.createEmployee(newUser);
  if (error) {
    console.error('Error creating profile:', error.message);
  } else if (data) {
    const newUser: User = {
      profile: this.photoPreviewUrl, //optional ('https://via.placeholder.com/200x200') //edited
      name: `${employee.firstname} ${employee.midname ? employee.midname + ' ' : ''}${employee.surname}`,
      email: employee.email,
      password: '***************',
      department: employee.department,
      position: employee.position,
      type: employee.type,
      status: 'Active',
      access: true
      //term: '' // Add this property to match the User interface
    };
    this.users.push(newUser);
    this.filteredUsers = this.users;
    this.updatePagination();
    this.toggleModal();
    this.resetForm();
  }
}

  ngOnInit() {
    this.loadEmployees();
    this.filteredTickets = this.tickets;
    this.selectedTickets = new Array(this.tickets.length).fill(false);
    this.updateDateTimeForTickets();
  }
  showPassword: boolean = false;

  
  async loadEmployees() {
    try {
      const { data, error } = await this.supabaseService.getEmployees();
      if (error) {
        console.error('Error fetching employees:', error.message);
      } else if (data) {
        this.users = data.map((employee: any): User => ({
          profile: 'https://via.placeholder.com/200x200',
          name: `${employee.first_name} ${employee.mid_name ? employee.mid_name + ' ' : ''}${employee.surname}`,
          email: employee.email,
          password: employee.password, // Make sure this line is present
          department: employee.department,
          position: employee.position,
          type: employee.types,
          status: 'Active',
          access: true
          //term: '' // Add this property to match the User interface
        }));
        this.filteredUsers = this.users;
        this.updatePagination();
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  }

  searchTable() {
    this.filteredUsers = this.users.filter(user =>
      user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.position.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.updatePagination();
  }
  
  getContractType(position: string): string {
    const positionLower = position.toLowerCase();
    switch (positionLower) {
      case 'manager':
      case 'developer':
        return 'Full-time';
      case 'designer':
        return 'Contract';
      case 'analyst':
        return 'Part-time';
      case 'intern':
        return 'Intern';
      default:
        return 'Part-time';
    }
  }

  toggleUserAccess(user: User) {
    user.access = !user.access;
  }
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  // Delete user
deleteUsers() {
  const selectedUsers = this.getSelectedUsers();
  if (selectedUsers.length === 0) {
    console.log("No users selected for deletion");
    return;
  }

  // Selecting users to delete
  selectedUsers.forEach(selectedUser => {
    this.supabaseService.deleteUser(selectedUser.email)
      .then(response => {
        if (response.error) {
          console.error('Error deleting user:', response.error.message);
        } else {
          console.log(`User ${selectedUser.email} deleted successfully`);
        }
      })
      .catch(error => console.error('Error deleting user:', error));
  });

  // Remove users locally
  this.users = this.users.filter(user => !selectedUsers.includes(user));
  this.filteredUsers = this.filteredUsers.filter(user => !selectedUsers.includes(user));

  console.log(`Deleted ${selectedUsers.length} users`);

  // Update pagination
  this.updatePagination();

  // // Refresh the page
  // window.location.reload();
}


  clearSelections() {
    this.users.forEach(user => user.selected = false);
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    this.currentPage = 1;
    this.paginate();
  }

  paginate() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedUsers = this.filteredUsers.slice(start, end);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginate();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginate();
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  toggleEditMode() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.clearSelections();
    }
  }

  editUser(user: User) {
    this.employee = {
      email: user.email,
      password: user.password, // Change this line to use the user's password
      firstname: user.name.split(' ')[0],
      midname: user.name.split(' ').length > 2 ? user.name.split(' ')[1] : '',
      surname: user.name.split(' ')[user.name.split(' ').length - 1],
      position: user.position,
      department: user.department,
      type: user.type
    };
    this.photoPreviewUrl = user.profile;
    this.showModal = true;
    this.isEditing = true;
  }

  resetAccessForm() {
    this.newRole = '';
    this.departmentType = 'all';
    this.selectedDepartments = [];
    this.selectedModules = [];
    this.selectedReports = [];
    this.selectedDataAccess = [];
    this.selectedPrivileges = [];
  }


  toggleManagePopup() {
    this.showManagePopup = !this.showManagePopup;
  }

  toggleAddPopup() {
    this.showAddPopup = !this.showAddPopup;
    if (this.showAddPopup){
      this.resetAccessForm();
    }
  }


  closeAddPopup() {
    this.showAddPopup = false;
    this.resetAccessForm();
  }

  toggleEditPopup() {
    this.showEditPopup = !this.showEditPopup;
  }

  closeEditPopup() {
    this.showEditPopup = false;
  }

  toggleAccessRightsPopup() {
    this.showAccessRightsPopup = !this.showAccessRightsPopup;
  }

  exitPopup(): void {
    this.showManagePopup = false;
  }

  closePopupOutside(event: MouseEvent): void {
    this.showManagePopup = false;
  }

  toggleAddDepartmentPopup() {
    this.showAddDepartmentPopup = !this.showAddDepartmentPopup;
    if (this.showAddDepartmentPopup) {
      this.resetDepartmentForm();
    }
  }

  closeAddDepartmentPopup() {
    this.showAddDepartmentPopup = false;
    this.resetDepartmentForm();
  }

  resetDepartmentForm() {
    this.newDepartment = '';
    this.departmentAccessRights.forEach(access => this.departmentAccess[access] = false);
  }

  saveDepartment() {
    if (!this.newDepartment) {
      alert('Please enter a department name');
      return;
    }

    const departmentData = {
      department: this.newDepartment,
      accessRights: this.departmentAccess
    };

    console.log('Saving department:', departmentData);
    // Implement your logic to save the department data

    this.closeAddDepartmentPopup();
  }

  updateSelectedModules(event: any) {
    const value = event.target.value;
    if (event.target.checked) {
      this.selectedModules.push(value);
    } else {
      this.selectedModules = this.selectedModules.filter(module => module !== value);
    }
  }
  
  updateSelectedReports(event: any) {
    const value = event.target.value;
    if (event.target.checked) {
      this.selectedReports.push(value);
    } else {
      this.selectedReports = this.selectedReports.filter(report => report !== value);
    }
  }
  
  updateSelectedDataAccess(event: any) {
    const value = event.target.value;
    if (event.target.checked) {
      this.selectedDataAccess.push(value);
    } else {
      this.selectedDataAccess = this.selectedDataAccess.filter(data => data !== value);
    }
  }
  
  updateSelectedPrivileges(event: any) {
    const value = event.target.value;
    if (event.target.checked) {
      this.selectedPrivileges.push(value);
    } else {
      this.selectedPrivileges = this.selectedPrivileges.filter(privilege => privilege !== value);
    }
  }

  // Method to search tickets
searchTicketTable() {
  const searchTerm = this.searchTicketTerm.toLowerCase();
  this.filteredTickets = this.tickets.filter(ticket => 
    ticket.title.toLowerCase().includes(searchTerm) ||
    ticket.description.toLowerCase().includes(searchTerm) ||
    ticket.status.toLowerCase().includes(searchTerm)
    );
    this.ticketUpdatePagination();
  }

// Method to toggle all tickets selection
toggleAllTickets() {
    const selectAll = this.selectedTickets.every(selected => selected);
    this.selectedTickets.fill(!selectAll);
  }

// Method to get selected tickets
getSelectedTickets(): Ticket[] {
    return this.tickets.filter((ticket, index) => this.selectedTickets[index]);
  }

// Method to update a ticket
updateTicket(updatedTicket: Ticket) {
  const index = this.tickets.findIndex(ticket => ticket.id === updatedTicket.id);
  if (index !== -1) {
    this.tickets[index] = updatedTicket;
    this.filteredTickets = [...this.tickets];
    this.ticketUpdatePagination();
    }
  }

// Method to delete a ticket
deleteTicket(ticketId: number) {
  const index = this.tickets.findIndex(ticket => ticket.id === ticketId);
  if (index !== -1) {
    this.tickets.splice(index, 1);
    this.filteredTickets = [...this.tickets];
    this.selectedTickets.splice(index, 1);
    this.ticketUpdatePagination();
    }
  }

// Method to delete selected tickets
deleteSelectedTickets() {
  const selectedIndexes = this.selectedTickets
    .map((selected, index) => selected ? index : -1)
    .filter(index => index !== -1);

  for (let i = selectedIndexes.length - 1; i >= 0; i--) {
    const index = selectedIndexes[i];
    this.tickets.splice(index, 1);
    this.selectedTickets.splice(index, 1);
    }
    this.filteredTickets = [...this.tickets];
    this.ticketUpdatePagination();
  }

// Method to prompt user for filter options
promptFilterOptions() {
  const markAsRead = confirm("Mark all tickets as read? Click 'Cancel' to mark all as unread.");
  if (markAsRead) {
    this.markAllAsRead();
    } else {
    this.markAllAsUnread();
    }
  }

// Method to mark all tickets as read
markAllAsRead() {
    this.tickets.forEach(ticket => ticket.status = 'Read');
    this.filteredTickets = [...this.tickets];
    this.ticketUpdatePagination();
  }

// Method to mark all tickets as unread
markAllAsUnread() {
    this.tickets.forEach(ticket => ticket.status = 'Unread');
    this.filteredTickets = [...this.tickets];
    this.ticketUpdatePagination();
  }

// Method to filter tickets based on selected option
filterTickets() {
  switch (this.filterOption) {
    case 'read':
      this.filteredTickets = this.tickets.filter(ticket => ticket.status.toLowerCase() === 'read');
      break;
    case 'unread':
      this.filteredTickets = this.tickets.filter(ticket => ticket.status.toLowerCase() === 'unread');
      break;
    default:
      this.filteredTickets = [...this.tickets];
      break;
    }
    this.ticketUpdatePagination();
  }

// Pagination Methods for Support Tickets
ticketTotalPages(): number {
    return Math.ceil(this.filteredTickets.length / this.ticket_itemsPerPage);
  }

ticketUpdatePagination() {
    this.ticket_currentPage = 1;
    this.ticketPaginate();
  }

ticketPaginate(): Ticket[] {
    const start = (this.ticket_currentPage - 1) * this.ticket_itemsPerPage;
    const end = start + this.ticket_itemsPerPage;
    return this.filteredTickets.slice(start, end);
  }

ticketPrevPage() {
  if (this.ticket_currentPage > 1) {
    this.ticket_currentPage--;
    this.ticketPaginate();
    }
  }

ticketNextPage() {
  if (this.ticket_currentPage < this.ticketTotalPages()) {
    this.ticket_currentPage++;
    this.ticketPaginate();
    }
  }

  updateDateTimeForTickets() {
    // Update dateTime property for each ticket
    this.tickets.forEach(ticket => {
      ticket.dateTime = new Date(); // Assign current date and time
    });
  }
  
  openTicketDetails(ticket: any) {
    this.selectedTicket = ticket;
    this.isModalVisible = true;
  }

  closeModal() {
    this.isModalVisible = false;
  }
}

