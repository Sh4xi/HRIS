import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  profile: string;
  name: string;
  email: string;
  password: string;
  department: string;
  position: string;
  term: string;
  status: string;
  access: boolean;
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

  showModal = false;
  photoPreviewUrl = 'https://via.placeholder.com/200x200';
  employee: Employee = {
    email: '',
    firstName: '',
    middleName: '',
    surname: '',
    position: '',
    department: '',
    type: ''
  };

  ngOnInit() {
    this.initializeUsers();
    this.updatePagination();
  }

  initializeUsers() {
    // Your existing user data initialization
    this.users = [
      {
        profile: 'path_to_your_image1.jpg',
        name: 'Mah Doe Rat\'on',
        email: 'm.doerat@example.com',
        password: '***************',
        department: 'General Affairs',
        position: 'Officer-In-Charge',
        term: 'Full Time',
        status: 'Active',
        access: true
      },
      {
        profile: 'path_to_your_image2.jpg',
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: '***************',
        department: 'Human Resources',
        position: 'HR Manager',
        term: 'Part Time',
        status: 'Active',
        access: true
      },
      {
        profile: 'path_to_your_image3.jpg',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: '***************',
        department: 'Marketing',
        position: 'Marketing Specialist',
        term: 'Full Time',
        status: 'Inactive',
        access: false
      },
      {
        profile: 'path_to_your_image4.jpg',
        name: 'Anna Brown',
        email: 'anna.brown@example.com',
        password: '***************',
        department: 'Finance',
        position: 'Financial Analyst',
        term: 'Full Time',
        status: 'Active',
        access: true
      },
      {
        profile: 'path_to_your_image1.jpg',
        name: 'Mah Doe Rat\'on',
        email: 'm.doerat@example.com',
        password: '***************',
        department: 'General Affairs',
        position: 'Officer-In-Charge',
        term: 'Full Time',
        status: 'Active',
        access: true
      },
      {
        profile: 'path_to_your_image2.jpg',
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: '***************',
        department: 'Human Resources',
        position: 'HR Manager',
        term: 'Part Time',
        status: 'Active',
        access: true
      },
      {
        profile: 'path_to_your_image3.jpg',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: '***************',
        department: 'Marketing',
        position: 'Marketing Specialist',
        term: 'Full Time',
        status: 'Inactive',
        access: false
      },
      {
        profile: 'path_to_your_image4.jpg',
        name: 'Anna Brown',
        email: 'anna.brown@example.com',
        password: '***************',
        department: 'Finance',
        position: 'Financial Analyst',
        term: 'Full Time',
        status: 'Active',
        access: true
      },
      // ... (your existing user data)
    ];
    this.filteredUsers = this.users;
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

  toggleModal() {
    this.showModal = !this.showModal;
    if (!this.showModal) {
      this.resetEmployeeForm();
    }
  }

  onPhotoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.photoPreviewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  onSubmit() {
    if (this.isFormValid()) {
      this.createEmployee(this.employee);
      this.toggleModal();
    } else {
      console.log('Please fill in all required fields');
    }
  }

  isFormValid(): boolean {
    const { email, firstName, surname, position, department, type } = this.employee;
    return !!(email && firstName && surname && position && department && type);
  }

  createEmployee(employee: Employee) {
    const newUser: User = {
      profile: this.photoPreviewUrl || 'assets/default-profile.jpg',
      name: `${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.surname}`,
      email: employee.email,
      password: '***************',
      department: employee.department,
      position: employee.position,
      term: this.getContractType(employee.position),
      status: 'Active',
      access: true
    };

    this.users.unshift(newUser);
    this.filteredUsers = this.users;
    this.updatePagination();
    this.resetEmployeeForm();

    console.log('New employee created:', newUser);
  }

  resetEmployeeForm() {
    this.employee = {
      email: '',
      firstName: '',
      middleName: '',
      surname: '',
      position: '',
      department: '',
      type: ''
    };
    this.photoPreviewUrl = 'https://via.placeholder.com/200x200';
  }

  searchTable() {
    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.name.toLowerCase().includes(searchTermLower) ||
      user.email.toLowerCase().includes(searchTermLower) ||
      user.department.toLowerCase().includes(searchTermLower) ||
      user.position.toLowerCase().includes(searchTermLower)
    );
    this.updatePagination();
  }

  addRole() {
    console.log("Adding Role");
    // Implement your add role logic here
  }

  toggleUserAccess(user: User) {
    user.access = !user.access;
  }

  deleteUsers() {
    console.log("Deleting all users");
    this.users = [];
    this.filteredUsers = [];
    this.updatePagination();
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
}