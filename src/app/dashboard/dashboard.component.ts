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
  userEmail: string = ''; // Add this line to declare userEmail

  dashboardCards: DashboardCard[] = [
    { title: 'Total Employees', value: 0 },
    { title: 'DTR', value: 5 },
    { title: 'New Applications', value: 8 }
  ];

  constructor(private router: Router, private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.fetchUserEmail();
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

  async fetchUserEmail() {
    try {
      const { data: { user }, error: userError } = await this.supabaseService.getUser();
      if (userError) {
        console.error('User authentication error:', userError.message);
        throw userError;
      }
      if (!user || !user.email) {
        throw new Error('No authenticated user found or email is missing');
      }

      console.log('Fetched user email:', user.email);
      this.userEmail = user.email!; // Use non-null assertion operator
    } catch (error) {
      console.error('Error fetching user email:', error);
      this.userEmail = ''; // Set to empty string if there's an error
    }
  }

  async timeIn() {
    try {
      const name = this.userEmail;
  
      if (!name) {
        throw new Error('User email not available');
      }
  
      // Check if the user has already timed in today
      const hasTimedIn = await this.supabaseService.hasTimedInToday(name);
      if (hasTimedIn) {
        alert('You have already timed in today. You can only time in once per day.');
        return;
      }
  
      const status = 'Time In';
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

  async timeOut() {
    try {
      const name = this.userEmail;

      if (!name) {
        throw new Error('User email not available');
      }

      const result = await this.supabaseService.updateDTRClockOut(name);
      if (result.error) {
        throw result.error;
      }
      console.log('Time Out recorded successfully:', result.data);
      alert('Time Out recorded successfully');
    } catch (error) {
      console.error('Error recording Time Out:', error);
      if (error instanceof Error) {
        alert(`Error recording Time Out: ${error.message}`);
      } else {
        alert('Error recording Time Out. Please try again.');
      }
    }
  }
}
