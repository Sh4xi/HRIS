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

  ngOnInit() {
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
        profile: 'path_to_your_image5.jpg',
        name: 'Michael Johnson',
        email: 'michael.johnson@example.com',
        password: '***************',
        department: 'Sales',
        position: 'Sales Representative',
        term: 'Full Time',
        status: 'Active',
        access: true
      },
      {
        profile: 'path_to_your_image6.jpg',
        name: 'Emily Davis',
        email: 'emily.davis@example.com',
        password: '***************',
        department: 'Operations',
        position: 'Operations Manager',
        term: 'Full Time',
        status: 'Active',
        access: true
      },
      {
        profile: 'path_to_your_image7.jpg',
        name: 'David Wilson',
        email: 'david.wilson@example.com',
        password: '***************',
        department: 'IT',
        position: 'Software Engineer',
        term: 'Full Time',
        status: 'Active',
        access: true
      },
      {
        profile: 'path_to_your_image8.jpg',
        name: 'Sophia Lee',
        email: 'sophia.lee@example.com',
        password: '***************',
        department: 'Customer Support',
        position: 'Customer Support Specialist',
        term: 'Part Time',
        status: 'Active',
        access: true
      },
      {
        profile: 'path_to_your_image9.jpg',
        name: 'Daniel Martinez',
        email: 'daniel.martinez@example.com',
        password: '***************',
        department: 'Research and Development',
        position: 'Research Scientist',
        term: 'Full Time',
        status: 'Inactive',
        access: false
      },
      {
        profile: 'path_to_your_image10.jpg',
        name: 'Olivia Thompson',
        email: 'olivia.thompson@example.com',
        password: '***************',
        department: 'Legal',
        position: 'Legal Counsel',
        term: 'Full Time',
        status: 'Active',
        access: true
      },
      {
        profile: 'path_to_your_image11.jpg',
        name: 'William Harris',
        email: 'william.harris@example.com',
        password: '***************',
        department: 'Human Resources',
        position: 'Recruitment Specialist',
        term: 'Full Time',
        status: 'Active',
        access: true
      },
      {
        profile: 'path_to_your_image12.jpg',
        name: 'Emma Clark',
        email: 'emma.clark@example.com',
        password: '***************',
        department: 'Marketing',
        position: 'Social Media Manager',
        term: 'Part Time',
        status: 'Active',
        access: true
      },
      {
        profile: 'path_to_your_image13.jpg',
        name: 'Alexander White',
        email: 'alexander.white@example.com',
        password: '***************',
        department: 'Finance',
        position: 'Financial Controller',
        term: 'Full Time',
        status: 'Active',
        access: true
      },
      {
        profile: 'path_to_your_image14.jpg',
        name: 'Sophie Robinson',
        email: 'sophie.robinson@example.com',
        password: '***************',
        department: 'Operations',
        position: 'Operations Coordinator',
        term: 'Full Time',
        status: 'Active',
        access: true
      },
      {
        profile: 'path_to_your_image15.jpg',
        name: 'James Turner',
        email: 'james.turner@example.com',
        password: '***************',
        department: 'IT',
        position: 'System Administrator',
        term: 'Full Time',
        status: 'Active',
        access: true
      }
      // Add more users as needed to reach the 2nd page
    ];
    this.filteredUsers = this.users;
    this.updatePagination();
  }

  searchTable() {
    this.filteredUsers = this.users.filter(user =>
      user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.updatePagination();
  }

  // Function to add a role
  addRole() {
    // Implement your add role logic here
    console.log("Adding Role");
  }

  // Function to add a new employee (placeholder function)
  addEmployee() {
    // Implement your add employee logic here
    console.log("Adding New Employee");
  }

  deleteUsers() {
    // Implement delete functionality
    console.log("Deleting user");
    this.users = [];
    this.filteredUsers = [];
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
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
