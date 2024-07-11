import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SupabaseService } from '../Supabase/supabase.service';
import { SidebarNavigationModule } from '../sidebar-navigation/sidebar-navigation.module';

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
  imports: [CommonModule, RouterModule,SidebarNavigationModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  isExpanded = false;
  
  dashboardCards: DashboardCard[] = [
    { title: 'Total Employees', value: 0 },
    { title: 'Leaves Pending', value: 5 },
    { title: 'New Applications', value: 8 }
  ];

  constructor(private router: Router, private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.fetchDashboardData();
  }

  async fetchDashboardData() {
    try {
      const response = await this.supabaseService.getEmployees();
      if (!response.error) {
        const totalEmployees = response.data.length;
        this.dashboardCards = [
          { title: 'Total Employees', value: totalEmployees },
          { title: 'Leaves Pending', value: 7 },
          { title: 'New Applications', value: 10 }
        ];
      } else {
        console.error('Error fetching employees:', response.error.message);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
  expandSidebar() {
    setTimeout(() => {
      this.isExpanded = true;
    }, 100);
  }

  collapseSidebar() {
    setTimeout(() => {
      this.isExpanded = false;
    }, 300);
  }

  getIconForRoute(route: string): string {
    switch (route) {
      case '/dashboard': return 'dashboard';
      case '/user-management': return 'group';
      case '/system-management': return 'settings';
      case '/payroll': return 'attach_money';
      case '/performance': return 'trending_up';
      case '/recruitment': return 'person_add';
      case '/reports': return 'assessment';
      default: return 'circle';
    }
  }
}