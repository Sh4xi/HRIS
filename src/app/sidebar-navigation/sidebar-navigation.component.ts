import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../Supabase/supabase.service';
interface SidebarItem {
  name: string;
  route: string;
}

@Component({
  selector: 'app-sidebar-navigation',
  templateUrl: './sidebar-navigation.component.html',
  styleUrls: ['./sidebar-navigation.component.css']
})
export class SidebarNavigationComponent {
  isExpanded = false;

  sidebarItems: SidebarItem[] = [
    { name: 'Dashboard', route: '/dashboard' },
    { name: 'Employee Management', route: '/user-management' },
    { name: 'System Management', route: '/system-management' },
    { name: 'Payroll', route: '/payroll' },
    { name: 'Performance', route: '/performance' },
    { name: 'Recruitment', route: '/recruitment' },
    { name: 'Reports', route: '/reports' }
  ];

  private routeIconMap: { [key: string]: string } = {
    '/dashboard': 'dashboard',
    '/user-management': 'group',
    '/system-management': 'settings',
    '/payroll': 'attach_money',
    '/performance': 'trending_up',
    '/recruitment': 'person_add',
    '/reports': 'assessment'
  };

  constructor(
    private router: Router,
    private supabaseService: SupabaseService
  ) {}

  expandSidebar = () => setTimeout(() => this.isExpanded = true, 100);

  collapseSidebar = () => setTimeout(() => this.isExpanded = false, 300);

  navigateTo = (route: string) => this.router.navigate([route]);

  getIconForRoute = (route: string): string => this.routeIconMap[route] || 'circle';

  async signOut(event: Event): Promise<void> {
    event.preventDefault();
    try {
      await this.supabaseService.signOut();
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
}