import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

interface SidebarItem {
  name: string;
  route: string;
}

interface DashboardCard {
  title: string;
  value: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  sidebarItems: SidebarItem[] = [
    { name: 'Overview', route: '/overview' },
    { name: 'Employee Management', route: '/user-management' }, // Update the route to match the actual route
    { name: 'Attendance', route: '/attendance' },
    { name: 'Payroll', route: '/payroll' },
    { name: 'Performance', route: '/performance' },
    { name: 'Recruitment', route: '/recruitment' },
    { name: 'Reports', route: '/reports' }
  ];

  dashboardCards: DashboardCard[] = [
    { title: 'Total Employees', value: 150 },
    { title: 'Leaves Pending', value: 5 },
    { title: 'New Applications', value: 8 }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.fetchDashboardData();
  }

  fetchDashboardData() {
    // Simulating an API call
    setTimeout(() => {
      this.dashboardCards = [
        { title: 'Total Employees', value: 152 },
        { title: 'Leaves Pending', value: 7 },
        { title: 'New Applications', value: 10 }
      ];
    }, 1000);
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}

