import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../Supabase/supabase.service';
import { SidebarNavigationModule } from './../sidebar-navigation/sidebar-navigation.module';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-audit-trail',
  standalone: true,
  imports: [CommonModule, SidebarNavigationModule],
  templateUrl: './audit-trail.component.html',
  styleUrls: ['./audit-trail.component.css']
})
export class AuditTrailComponent implements OnInit, OnDestroy {
  auditLogs: any[] = [];
  private subscription: Subscription;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.subscription = new Subscription();
  }

  ngOnInit() {
    this.fetchAuditLogs();
    //this.subscribeToAuditLogUpdates();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // private subscribeToAuditLogUpdates() {
  //   this.subscription = this.supabaseService.getAuditLogUpdates().subscribe(newLog => {
  //     this.auditLogs.unshift(this.formatLogEntry(newLog));
  //   });
  // }

  async fetchAuditLogs() {
    try {
      const logs = await this.supabaseService.fetchAuditLogs();
      console.log('Fetched audit logs:', logs);
      this.auditLogs = logs.map(log => this.formatLogEntry(log));
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      // Handle the error appropriately (e.g., show an error message to the user)
    }
  }

  private formatLogEntry(log: any) {
    return {
      ...log,
      user_id: log.user_id || 'Unknown User',
      affected_page: log.affected_page || 'N/A',
      action: log.action || 'N/A',
      old_parameter: log.old_parameter || 'N/A',
      new_parameter: log.new_parameter || 'N/A'
    };
  }

  // async logUserAction(userId: string, action: string, affectedPage: string, oldParameter: string, newParameter: string) {
  //   try {
  //     await this.supabaseService.logAction(userId, action, affectedPage, oldParameter, newParameter);
  //     // The new log will be added automatically through the subscription
  //   } catch (error) {
  //     console.error('Error logging user action:', error);
  //     // Handle the error appropriately
  //   }
  // }
}


