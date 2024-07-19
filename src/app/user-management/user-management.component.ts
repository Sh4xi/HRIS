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
  profile: string;
  name: string;
  email: string;
  password: string;
  department: string;
  position: string;
  type: string;
  status: string;
  access: boolean;
}



interface Ticket {
  id: number;
  title: string;
  email: string;
  description: string;
  status: string;
  dateTime: Date;
}
interface AuditLogEntry {
  user_id: string;
  action: string;
  affected_page: string;
  parameter: string;
  old_value: string;
  new_value: string;
  ip_address: string;
  date: string;
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

  showAccessRightsPopup = false;
  showAddDepartmentPopup = false;
  isEditing: boolean = false;
  showModal = false;
  photoPreviewUrl: string = 'https://via.placeholder.com/200x200';;
  showPasswordGeneratedMessage: boolean = false;
  newRole = '';
  newDepartment = '';
  departmentType = 'all';
  selectedDepartments: string[] = [];
  departments = ['HR', 'IT', 'Finance', 'Marketing'];

  showPhotoMessage = true; // Property to control the visibility of the message
  showFileTypeAlert = false;
  showFileSizeAlert = false;
  photoFile: File | null = null;
  

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
  logAction: any;

  addNewRole() {
    this.showCheckboxes = !this.showCheckboxes;
  }

  roles: string[] = [];
  assignedRole: string = '';
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

  // Handle clicking a role in the Manage Roles table
  onRoleClick(role: string) {
    this.assignedRole = role;
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
    const maxSizeInBytes = 50 * 1024 * 1024; // 50MB

    // Reset alerts
    this.showFileTypeAlert = false;
    this.showFileSizeAlert = false;

    if (file) {
      if (file.size > maxSizeInBytes) {
        this.showFileSizeAlert = true;
        event.target.value = '';
        return;
      }

      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        this.showFileTypeAlert = true;
        event.target.value = '';
        return;
      }

      this.photoFile = file;

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
  
    try {
      const photoUrl = await this.uploadPhoto();
  
      const employeeData = {
        first_name: this.employee.firstname,
        mid_name: this.employee.midname,
        surname: this.employee.surname,
        email: this.employee.email,
        password: this.employee.password,
        department: this.employee.department,
        position: this.employee.position,
        types: this.employee.type,
        access: true,
        photo_url: photoUrl || this.photoPreviewUrl
      };
  
      console.log('Employee data to be sent:', employeeData);
  
      let response;
  
      if (this.isEditing) {
        console.log('Updating employee:', employeeData);
        response = await this.supabaseService.updateEmployee(employeeData);
  
        if (response.error) {
          console.error('Error updating employee:', response.error);
          alert('Error updating employee. Please try again.');
          return;
        } else {
          console.log('Employee updated successfully:', response.data);
        }
      } else {
        const emailExists = await this.supabaseService.checkEmailExists(this.employee.email);
        if (emailExists) {
          console.error('Email already exists. Please use a different email.');
          alert('Email already exists. Please use a different email.');
          return;
        }
  
        console.log('Creating employee:', employeeData);
        response = await this.supabaseService.createEmployee(employeeData);
  
        if (response.error) {
          console.error('Error creating employee:', response.error);
          alert('Error creating employee. Please try again.');
          return;
        } else {
          console.log('Employee created successfully:', response.data);
        }
      }
  
      alert(`Employee ${this.isEditing ? 'updated' : 'created'} successfully.`);
      this.toggleModal();
      this.resetForm();
      this.loadEmployees();
  
    } catch (error) {
      console.error('Error in onSubmit:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  }
  
  
  
  async uploadPhoto(): Promise<string | null> {
    if (!this.photoFile) {
      console.log('No photo file selected');
      return null;
    }
  
    try {
      console.log('Uploading photo:', this.photoFile.name);
      const fileName = `${Date.now()}_${this.photoFile.name}`;
      const { data, error } = await this.supabaseService.uploadFile('photos', fileName, this.photoFile);
  
      if (error) {
        console.error('Supabase upload error:', error);
        throw error;
      }
  
      console.log('Upload response:', data);
  
      if (data?.path) {
        const fullUrl = `https://vhmftufkipgbxmcimeuq.supabase.co/storage/v1/object/public/photos/${data.path}`;
        console.log('Full photo URL:', fullUrl);
        return fullUrl;
      } else {
        console.warn('Upload successful, but no path returned');
        return null;
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error uploading photo. Please try again.');
      return null;
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

  async updateEmployee(employee: any) {
    try {
      console.log('Updating employee:', employee);
  
      // Get the original employee data for audit logging
      const originalEmployee = this.users.find(user => user.email === employee.email);
      if (!originalEmployee) {
        throw new Error('Employee not found for update');
      }
  
      // Upload the photo and get the URL
      let photoUrl = null;
      if (this.photoFile) {
        photoUrl = await this.uploadPhoto();
        console.log('New photo uploaded, URL:', photoUrl);
      } else {
        console.log('No new photo to upload');
      }
  
      // Determine the profile picture URL
      const profileUrl = photoUrl || this.photoPreviewUrl || employee.photo_url || 'path/to/default/image.png';
      console.log('Profile URL to be used:', profileUrl);
  
      const updatedUser: Partial<User> = {
        profile: profileUrl,
        name: `${employee.firstname.trim()} ${employee.midname ? employee.midname.trim() + ' ' : ''}${employee.surname.trim()}`,
        email: employee.email.trim(),
        password: employee.password,
        department: employee.department.trim(),
        position: employee.position.trim(),
        type: employee.type.trim(),
        status: 'Active',
        access: true
      };
  
      console.log('Updated user object:', updatedUser);
  
      // Update user in the database
      const { data, error } = await this.supabaseService.updateEmployee({
        ...employee,
        photo_url: profileUrl
      });
  
      if (error) {
        console.error('Error updating employee in Supabase:', error);
        throw new Error(`Failed to update employee: ${error.message}`);
      }
  
      console.log('Employee updated successfully in Supabase:', data);
  
      // Update user locally
      const index = this.users.findIndex(user => user.email === employee.email);
      if (index !== -1) {
        this.users[index] = updatedUser as User;
        console.log('Local user array updated');
      } else {
        console.warn('User not found in local array for update');
      }
      this.filteredUsers = this.users;
      this.updatePagination();
  
      // Log the action
      const auditLogEntry: AuditLogEntry = {
        user_id: 'id', // or the ID of the user performing the action
        action: 'UPDATE_EMPLOYEE',
        affected_page: 'User Management',
        parameter: 'Employee Update',
        old_value: JSON.stringify(originalEmployee),
        new_value: JSON.stringify(updatedUser),
        ip_address: await this.getClientIpAddress(), // Implement this method to get the client's IP
        date: new Date().toISOString()
      };
  
      await this.supabaseService.logAction(auditLogEntry);
  
      // Close modal and reset form
      this.toggleModal();
      this.resetForm();
  
      // Reload employees to ensure consistency
      await this.loadEmployees();
  
      return updatedUser;
    } catch (error) {
      console.error('Error in updateEmployee:', error);
      // Show an error message to the user
      this.showErrorMessage('Failed to update employee. Please try again.');
      throw error; // Re-throw the error so it can be handled by the caller if needed
    }
  }
  
  // Implement these methods:
  
  private async getClientIpAddress(): Promise<string> {
    // Implement a method to get the client's IP address
    // You might need to use a third-party service or ask your backend to provide this information
    return 'client_ip';
  }
  
  private showErrorMessage(message: string): void {
    // Implement a method to show error messages to the user
    // This could be a modal, toast notification, or alert
    alert(message);
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
    console.log('Received employee data:', employee);
  
    if (!this.isValidEmail(employee.email)) {
      console.error('Invalid email format');
      alert('Please enter a valid email address.');
      return;
    }
  
    // Check for required fields
    const requiredFields = ['firstname', 'surname', 'department', 'position', 'type'];
    for (const field of requiredFields) {
      if (!employee[field]) {
        console.error(`Missing required field: ${field}`);
        alert(`Please fill in the ${field} field.`);
        return;
      }
    }
  
    try {
      const photoUrl = await this.uploadPhoto();
  
      const newEmployee = {
        profile: photoUrl || this.photoPreviewUrl,
        email: employee.email,
        first_name: employee.firstname.trim(),
        mid_name: employee.midname ? employee.midname.trim() : null,
        surname: employee.surname.trim(),
        password: this.generateRandomPassword(12),
        department: employee.department,
        position: employee.position,
        types: employee.type,
        status: 'Active',
        access: true
      };
  
      console.log('Sending employee data to Supabase:', newEmployee);
  
      const { data, error } = await this.supabaseService.createEmployee(newEmployee);
  
      if (error) {
        console.error('Error from Supabase:', error);
        alert(`Error creating employee: ${error.message}`);
        return;
      }
  
      if (!data) {
        console.error('No data returned from Supabase');
        alert('Error creating employee: No data returned');
        return;
      }
  
      console.log('Employee created successfully:', data);
  
      // Create audit log
      try {
        const userId = await this.supabaseService.getCurrentUserId();
        await this.createAuditLogWithRetry(userId, data);
      } catch (auditLogError) {
        console.error('Error creating audit log:', auditLogError);
        // Log the error but continue with the process
      }
  
      const newUser: User = {
        profile: newEmployee.profile,
        name: `${newEmployee.first_name} ${newEmployee.mid_name ? newEmployee.mid_name + ' ' : ''}${newEmployee.surname}`,
        email: newEmployee.email,
        password: '***************',
        department: newEmployee.department,
        position: newEmployee.position,
        type: newEmployee.types,
        status: newEmployee.status,
        access: newEmployee.access
      };
  
      this.users.push(newUser);
      this.filteredUsers = [...this.users];
      this.updatePagination();
      this.toggleModal();
      this.resetForm();
      alert('Employee created successfully.');
  
    } catch (error) {
      console.error('Unexpected error creating employee:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  }
  
  private async createAuditLogWithRetry(userId: string, data: any, retries = 3): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await this.supabaseService.createAuditLog({
          user_id: userId,
          affected_page: 'User Management',
          action: 'Create Employee',
          old_parameter: null,
          new_parameter: JSON.stringify(data)
        });
        console.log('Audit log created successfully');
        return;
      } catch (error) {
        console.error(`Attempt ${i + 1} failed to create audit log:`, error);
        if (i === retries - 1) {
          throw error; // Throw the error after all retries have failed
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
      }
    }
  }
  ngOnInit() {
    this.loadEmployees();
    this.filteredTickets = this.tickets;
    this.selectedTickets = new Array(this.tickets.length).fill(false);
    this.updateDateTimeForTickets();
    this.loadTickets();
    this.loadEmployeeNames();

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

  //edit the photo here
  async loadEmployees() {
    try {
      console.log('Fetching employees...');
      const { data, error } = await this.supabaseService.getEmployees();
  
      if (error) {
        console.error('Error fetching employees:', error.message);
        throw error;
      }
  
      if (!data || data.length === 0) {
        console.warn('No employee data received');
        this.users = [];
        this.filteredUsers = [];
        this.updatePagination();
        return;
      }
  
      console.log(`Raw employee data (${data.length} employees):`, data);
  
      this.users = await Promise.all(data.map(async (employee: any, index: number): Promise<User> => {
        console.log(`Employee ${index} data:`, employee);
  
        let photoUrl: string | null = null;
        let employeeIdentifier: string | null = null;
  
        if (employee.id) {
          employeeIdentifier = employee.id.toString();
        } else if (employee.email) {
          employeeIdentifier = employee.email;
          console.warn(`Employee at index ${index} has no id, using email as identifier`);
        } else {
          console.warn(`Employee at index ${index} has no id or email`);
        }
  
        if (employeeIdentifier) {
          try {
            photoUrl = await this.supabaseService.getPhotoUrl(employeeIdentifier);
            console.log(`Photo URL for employee ${employeeIdentifier}:`, photoUrl);
          } catch (error) {
            console.error(`Error fetching photo URL for employee ${employeeIdentifier}:`, error);
          }
        }
  
        const user: User = {
          profile: photoUrl || 'photo_url',
          name: `${employee.first_name?.trim() || ''} ${employee.mid_name ? employee.mid_name.trim() + ' ' : ''}${employee.surname?.trim() || ''}`.trim(),
          email: employee.email?.trim() || '',
          password: employee.password || '',
          department: employee.department?.trim() || 'Unassigned',
          position: employee.position?.trim() || 'Unassigned',
          type: employee.types?.trim() || 'Unassigned',
          status: 'Active',
          access: true,
        };
  
        console.log(`Mapped user ${index + 1}:`, user);
  
        return user;
      }));
  
      console.log(`Total users mapped: ${this.users.length}`);
  
      this.filteredUsers = this.users;
      this.updatePagination();
  
      console.log('Employee loading complete');
    } catch (error) {
      console.error('Unexpected error while fetching employees:', error);
      // Here you might want to set some error state or show a user-facing error message
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
  async deleteUsers() {
    const selectedUsers = this.getSelectedUsers();
    if (selectedUsers.length === 0) {
      console.log("No users selected for deletion");
      return;
    }
  
    // Initialize a counter for successful deletions
    let successfulDeletions = 0;
  
    // Select users to delete
    for (const selectedUser of selectedUsers) {
      try {
        // Delete user profile and associated photo
        const response = await this.supabaseService.deleteUser(selectedUser.email);
        
        if (response.error) {
          console.error('Error deleting user:', response.error.message);
        } else {
          console.log(`User ${selectedUser.email} deleted successfully`);
          successfulDeletions++;
          
          // Remove the user locally
          this.users = this.users.filter(user => user.email !== selectedUser.email);
          this.filteredUsers = this.filteredUsers.filter(user => user.email !== selectedUser.email);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  
    console.log(`Deleted ${successfulDeletions} users`);
  
    // Update pagination
    this.updatePagination();
  
    // Optionally refresh the page
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
updateTicket(updatedTicket: Ticket) {             // Neeed to fix
  const index = this.tickets.findIndex(ticket => ticket.id === updatedTicket.id);
  if (index !== -1) {
    this.tickets[index] = updatedTicket;
    this.filteredTickets = [...this.tickets];
    this.ticketUpdatePagination();
    }
  }

// Method to delete a ticket
deleteTicket(ticketId: number) {           // Need to Fix
  const index = this.tickets.findIndex(ticket => ticket.id === ticketId);
  if (index !== -1) {
    this.tickets.splice(index, 1);
    this.filteredTickets = [...this.tickets];
    this.selectedTickets.splice(index, 1);
    this.ticketUpdatePagination();
    }
  }

// Method to delete selected tickets
deleteSelectedTickets() {               // Need to fix
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
markAllAsRead() {                   // Need to Fix
    this.tickets.forEach(ticket => ticket.status = 'Read');
    this.filteredTickets = [...this.tickets];
    this.ticketUpdatePagination();
  }

// Method to mark all tickets as unread
markAllAsUnread() {                 // Need to Fix
    this.tickets.forEach(ticket => ticket.status = 'Unread');
    this.filteredTickets = [...this.tickets];
    this.ticketUpdatePagination();
  }

// Method to filter tickets based on selected option
filterTickets() {                   // Need to Fix
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

ticketPrevPage() {                      // Need to Fix
  if (this.ticket_currentPage > 1) {
    this.ticket_currentPage--;
    this.ticketPaginate();
    }
  }

ticketNextPage() {                        // Need to fix
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

  editTicket(){
    // Update selectedTicket with changes
    this.updateTicket(this.selectedTicket);
    this.closeModal();
  }

  doneTicket(){
    // Mark selectedTicket as done
    this.selectedTicket.status = 'Done';
    this.updateTicket(this.selectedTicket);
    this.closeModal();
  }
}