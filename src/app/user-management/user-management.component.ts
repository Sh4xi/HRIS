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
  activeTab: string = 'users';
  showManagePopup = false;
  showAddPopup = false;
  showEditPopup = false;
  showAccessRightsPopup = false;

  showModal = false;
  photoPreviewUrl = 'https://via.placeholder.com/200x200';
  employee = {
    email: '',
    firstName: '',
    middleName: '',
    surname: '',
    position: '',
    department: '',
    type: ''
  };
  
  toggleModal() {
    this.showModal = !this.showModal;
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
    if (this.isFormValid()) {
      this.createEmployee(this.employee);
      this.toggleModal();
    } else {
      console.log('Please fill in all required fields');
    }
  }

  isFormValid(): boolean {
    return !!(this.employee.email && this.employee.firstName && this.employee.surname &&
              this.employee.position && this.employee.department && this.employee.type);
  }

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
      user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.position.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.updatePagination();
  }

  // Function to add a role
  addRole() {
    // Implement your add role logic here
    console.log("Adding Role");
  }

  // Function to add a new employee (placeholder function)
  createEmployee(employee: any) {
    const newUser: User = {
      profile: employee.photoPreviewUrl || 'assets/default-profile.jpg',
      name: `${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.surname}`,
      email: employee.email,
      password: '***************',
      department: employee.department,
      position: employee.position,
      term: employee.type,
      status: 'Active',
      access: true
    };
  
    this.users.push(newUser);
    this.filteredUsers = this.users;
    this.updatePagination();
  
    console.log('New employee created:', newUser);
  }

  toggleUserAccess(user: User) {
    user.access = !user.access;
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

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  toggleManagePopup() {
    this.showManagePopup = !this.showManagePopup;
  }

  toggleAddPopup(){
    this.showAddPopup = !this.showAddPopup;
  }

  closeAddPopup() {
    this.showAddPopup = false;
  }

  toggleEditPopup(){
    this.showEditPopup = !this.showAddPopup;
  }

  closeEditPopup(){
    this.showEditPopup = false;
  }

  toggleAccessRightsPopup(){
    this.showAccessRightsPopup = !this.showAccessRightsPopup;
  }

  exitPopup(): void{
    this.showManagePopup = false;
  }

  closePopupOutside(event: MouseEvent): void {
    this.showManagePopup = false;
  }

}
