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
  imports: [CommonModule, RouterModule, SidebarNavigationModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  isExpanded = false;
  
  dashboardCards: DashboardCard[] = [
    { title: 'Total Employees', value: 0 },
    { title: 'DTR', value: 5 },
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
          { title: 'DTR', value: 7 },
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


  async timeIn() {
    try {
      const status = 'Time In';
      const name = 'cheska'; // You mentioned this name earlier
      
      const result = await this.supabaseService.insertDTRRecord(status, name);
      console.log('Time In recorded successfully:', result);
      alert('Time In recorded successfully');
    } catch (error) {
      console.error('Error recording Time In:', error);
      if (error instanceof Error) {
        alert(`Error recording Time In: ${error.message}`);
      } else {
        alert('Error recording Time In. Please try again.');
      }
    }
  }

  async timeOut(){

  }
}
