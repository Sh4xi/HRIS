import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../Supabase/supabase.service';
import { SidebarNavigationModule } from './../sidebar-navigation/sidebar-navigation.module';

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
  photoUrl?: string; // Add a new property for photo URL
}


interface Ticket {
  id: number;
  title: string;
  email: string;
  description: string;
  status: string;
  dateTime: Date;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarNavigationModule],
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
  employees: any[] = [];
  roles: any[] = [];
  assignedUsers: any[] = [];

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
  searchTicketTerm: string = '';
  ticket_currentPage: number = 1;
  ticket_itemsPerPage: number = 10;

  filteredTickets: Ticket[] = [];
  selectedTickets: boolean[] = [];
  filterOption: string = 'all'; // Default filter option

  selectedTicket: any = null;
  isModalVisible = false;
  replyText: string = ''; // Text for the reply

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
    'Recruitment, Selection and PlaFrcement',
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

  assignedEmployees: string[] = ['Kobe Bryant', 'Alice Guo', 'Carlo Sotto', 'Harry Roque'];
  showCheckboxes = false;

  addNewRole() {
    this.showCheckboxes = !this.showCheckboxes;
  }

  assignedRole: any = null;
  showRolePopup: boolean = false;
  newManageRole: string = '';

  openRolePopup() {
    this.showRolePopup = true;
  }

  closeRolePopup() {
    this.showRolePopup = false;
  }

  confirmRolePopup() {
    if (this.newManageRole.trim()) {
      this.roles.push(this.newManageRole.trim());
    }
    this.newManageRole = '';
    this.showRolePopup = false;
  }

  cancelRolePopup() {
    this.newManageRole = '';
    this.showRolePopup = false;
  }

  // Delete a role
  async deleteRole(role: any) {
    await this.supabaseService.deleteRole(role.role_name);
    this.roles = this.roles.filter(r => r.role_name !== role.role_name);
  }
  


  // Handle clicking a role in the Manage Roles table
  async onRoleClick(role: { role_id: number, role_name: string }) {
    console.log('Role clicked:', role);
    this.assignedRole = role;
    await this.loadAssignedUsers(role);
    console.log('Assigned Role:', this.assignedRole);
  }

  // Mockdata for Tickets
  tickets: Ticket[] = [];

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
  showPassword: any;

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
    const maxSizeInBytes = 50 * 1024 * 1024; // 2MB
  
    // Reset alerts
    this.showFileTypeAlert = false;
    this.showFileSizeAlert = false;
  
    if (file) {
      if (file.size > maxSizeInBytes) {
        // Display size alert if the file exceeds 2MB
        this.showFileSizeAlert = true;
        event.target.value = ''; // Clear the file input
        return;
      }
  
      if (file.type !== 'image/png') {
        // Display type alert if the file is not a PNG
        this.showFileTypeAlert = true;
        event.target.value = ''; // Clear the file input
        return;
      }
  
      // Read and display the selected image file
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreviewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
  
  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  async onSubmit() {
    if (!this.isValidEmail(this.employee.email)) {
      console.error('Invalid email format');
      alert('Please enter a valid email address.');
      return;
    }
  
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
      this.showRolePopup = false;
    }
  
    // if (this.departmentType === 'specific' && !this.selectedDepartments) {
    //   alert('Please select a department');
    //   return;
    // }
  
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
  
    // Load assigned users for the selected role
    async loadAssignedUsers(role: { role_id: number, role_name: string }) {
      this.assignedRole = role;
      console.log('Loading assigned users for role:', this.assignedRole);
    
      try {
        const users = await this.supabaseService.getUsersAssignedToRole(role.role_id);
        this.assignedUsers = users;
        console.log('Assigned users:', this.assignedUsers);
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error loading assigned users:', error.message);
        } else {
          console.error('An unknown error occurred');
        }
      }
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
    if (!this.isValidEmail(employee.email)) {
      console.error('Invalid email format');
      alert('Please enter a valid email address.');
      return;
    }
  
    const newUser = {
      email: employee.email,
      first_name: employee.firstname,
      mid_name: employee.midname,
      surname: employee.surname,
      password: this.generateRandomPassword(8), // Use the generated password
      department: employee.department,
      position: employee.position,
      types: employee.type
    };
  
    const { data, error } = await this.supabaseService.createEmployee(newUser);
    if (error) {
      console.error('Error creating profile:', error.message);
    } else if (data) {
      const newUser: User = {
        profile: this.photoPreviewUrl,
        name: `${employee.firstname} ${employee.midname ? employee.midname + ' ' : ''}${employee.surname}`,
        email: employee.email,
        password: '***************',
        department: employee.department,
        position: employee.position,
        type: employee.type,
        status: 'Active',
        access: true
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
    this.loadTickets();
    this.loadEmployeeNames();
    this.loadRoles();

  } 

  async loadRoles() {
    try {
      this.roles = await this.supabaseService.getRoles();
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  }

    // Added method to fetch employee names
    loadEmployeeNames(): void {
      this.supabaseService.getEmployeeNames().then(data => {
        if (data) {  // Ensure data is not null
          this.employees = data.map(emp => ({
            firstname: emp.first_name,
            midname: emp.mid_name,
            surname: emp.surname
          }));
        } else {
          console.error('No employee data found.');
        }
      }).catch(error => {
        console.error('Error fetching employees:', error);
      });
    }

  // Fetch tickets from the database
  async loadTickets() {
    try {
      const { data, error } = await this.supabaseService.getTickets();
      if (error) {
        console.error('Error fetching tickets:', error.message);
      } else if (data) {
        this.tickets = data;
        this.filteredTickets = this.tickets;
        this.selectedTickets = new Array(this.tickets.length).fill(false);
        this.ticketUpdatePagination();
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  }

  
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
    user.status = user.access ? 'Active' : 'Inactive';
  }

  // ticketStatus(ticket: Ticket){
  //   ticket.status = !ticket;
  //   ticket.status = ticket.status? 'Open' : 'Closed' : 'In-progress';
  // }

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
      department_name: this.newDepartment,
      mod_access: this.selectedModules.length > 0 ? this.selectedModules : [],
      rep_access: this.selectedReports.length > 0 ? this.selectedReports : [],
      data_access: this.selectedDataAccess.length > 0 ? this.selectedDataAccess : [],
      privileges: this.selectedPrivileges.length > 0 ? this.selectedPrivileges : [],
    };
  
    this.supabaseService.createDepartment(departmentData)
    .then(response => {
      if (response.error) {
        console.error('Error creating department:', response.error.message);
      } else {
        if (response.data) {
          console.log('Department created successfully:', response.data);
        } else {
          console.log('Department created successfully, but no data returned.');
        }
        this.closeAddDepartmentPopup();
      }
    });
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
async deleteSelectedTickets() {
  const selectedTickets = this.getSelectedTickets();
  if (selectedTickets.length === 0) {
    console.log("No tickets selected for deletion");
    return;
  }

  try {
    for (const ticket of selectedTickets) {
      const { error } = await this.supabaseService.deleteTicket(ticket.id);
      if (error) {
        console.error(`Error deleting ticket ${ticket.id}:`, error.message);
      } else {
        console.log(`Ticket ${ticket.id} deleted successfully`);
      }
  }

// Remove deleted tickets from local arrays
this.tickets = this.tickets.filter(ticket => !selectedTickets.includes(ticket));
this.filteredTickets = this.filteredTickets.filter(ticket => !selectedTickets.includes(ticket));
this.selectedTickets = this.selectedTickets.filter((_, index) => !this.selectedTickets[index]);
  console.log(`Deleted ${selectedTickets.length} tickets`);
    // Update pagination
      this.ticketUpdatePagination();
     // Refresh the ticket list
      await this.loadTickets();
    } catch (error) {
      console.error('Error deleting tickets:', error);
    }
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

 // Method to update ticket priority
 updateTicketPriority(ticket: Ticket, event: Event): void {
  const selectElement = event.target as HTMLSelectElement;
  const newPriority = selectElement.value as 'Low' | 'Medium' | 'High' | 'Urgent';
  ticket.priority = newPriority;
  // Add logic to save the updated ticket priority, e.g., update the backend or state
}

closeModal() {
  this.isModalVisible = false;
}

replyTicket(): void {
  if (this.selectedTicket) {
    // Logic for replying to a ticket
    this.selectedTicket.reply = this.replyText;
    this.updateTicket(this.selectedTicket);
    this.closeModal();
    this.replyText = ''; // Reset reply text after sending
  } else {
    console.log('No ticket selected to reply.');
  }
}

  // doneTicket(){
  //   // Mark selectedTicket as done
  //   this.selectedTicket.status = 'Done';
  //   this.updateTicket(this.selectedTicket);
  //   this.closeModal();
  // }
}

