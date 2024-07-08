import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../Supabase/supabase.service';

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

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
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
  isEditing: boolean = false; // Flag to manage edit mode

  showModal = false;
  photoPreviewUrl = 'https://via.placeholder.com/200x200';

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

  constructor(private supabaseService: SupabaseService) {}
  
  toggleModal() {
    this.showModal = !this.showModal;
    if (!this.showModal) {
      this.resetForm();
    }
  }


  onPhotoChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreviewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

onSubmit() {
    console.log('Submitting form with employee data:', this.employee);
    this.supabaseService.createEmployee(this.employee)
      .then(response => {
        if (response.error) {
          console.error('Error creating employee:', response.error.message);
        } else {
          console.log('Employee created successfully:', response.data);
          this.toggleModal(); // Close the modal
          this.resetForm(); // Clear the form
          this.loadEmployees(); // Reload employees
        }
      });
  }

  toggleUserSelection(user: User) {
    user.selected = !user.selected;
  }

  getSelectedUsers(): User[] {
    return this.users.filter(user => user.selected);
  }
  
  updateEmployee(employee: any, index: number) {
    const updatedUser: User = {
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
  
    this.users[index] = updatedUser;
    this.filteredUsers = this.users;
    this.updatePagination();
  
    // Call your Supabase service to update the employee in the database
    this.supabaseService.updateEmployee(employee).then(response => {
      if (response.error) {
        console.error('Error updating employee:', response.error.message);
      } else {
        console.log('Employee updated successfully:', response.data);
      }
    });
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
      password: 'hashed_password_placeholder', // Hash the password before storing
      department: employee.department,
      position: employee.position,
      types: employee.type
    };

    const { data, error } = await this.supabaseService.createEmployee(newUser);
    if (error) {
      console.error('Error creating profile:', error);
    } else {
      this.users.push({
        profile: this.photoPreviewUrl,
        name: `${employee.firstname} ${employee.midname ? employee.midname + ' ' : ''}${employee.surname}`,
        email: employee.email,
        password: '***************',
        department: employee.department,
        position: employee.position,
        type: employee.type,
        status: 'Active',
        access: true
      });
      this.filteredUsers = this.users;
      this.updatePagination();
    }
  }

  ngOnInit() {
    this.loadEmployees();
  }

  async loadEmployees() {
    try {
      const { data, error } = await this.supabaseService.getEmployees();
      if (error) {
        console.error('Error fetching employees:', error.message);
      } else {
        this.users = data.map((employee: any) => ({
          profile: 'https://via.placeholder.com/200x200', // Replace with actual profile image if available
          name: `${employee.first_name} ${employee.mid_name ? employee.mid_name + ' ' : ''}${employee.surname}`,
          email: employee.email,
          password: '***************', // You may not want to expose passwords here
          department: employee.department,
          position: employee.position,
          type: employee.types,
          status: 'Active', // Assuming status is always active for fetched employees
          access: true // Assuming all fetched employees have access
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
  addRole() {
    console.log("Adding Role");
    // Implement your add role logic here
  }

  toggleUserAccess(user: User) {
    user.access = !user.access;
  }

  //DELETEEEE
  deleteUsers() {
    const selectedUsers = this.getSelectedUsers();
    if (selectedUsers.length === 0) {
      console.log("No users selected for deletion");
      return;
    }
    
    selectedUsers.forEach(selectedUser => {
      this.users = this.users.filter(user => user !== selectedUser);
      this.filteredUsers = this.filteredUsers.filter(user => user !== selectedUser);
    });
    
    console.log(`Deleted ${selectedUsers.length} users`);
    this.updatePagination();
  }

  clearSelections() {
    this.users.forEach(user => user.selected = false);
  }

  toggleEditMode() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.clearSelections();
    }
  }

  

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    this.currentPage = 1; // Reset to first page when updating pagination
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

  
  //EDIT
  editUser(user: User) {
    this.employee = {
      email: user.email,
      password: '', // Don't populate the password for security reasons
      firstname: user.name.split(' ')[0],
      midname: user.name.split(' ').length > 2 ? user.name.split(' ')[1] : '',
      surname: user.name.split(' ')[user.name.split(' ').length - 1],
      position: user.position,
      department: user.department,
      type: user.type
    };
    this.photoPreviewUrl = user.profile;
    this.showModal = true;
  }

  toggleManagePopup() {
    this.showManagePopup = !this.showManagePopup;
  }

  toggleAddPopup() {
    this.showAddPopup = !this.showAddPopup;
  }

  closeAddPopup() {
    this.showAddPopup = false;
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
}
