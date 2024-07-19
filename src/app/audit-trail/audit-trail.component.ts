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
  private subscription: any; // Changed from Subscription to any

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchAuditLogs();
    this.subscribeToAuditLogUpdates();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private subscribeToAuditLogUpdates() {
    this.subscription = this.supabaseService.subscribeToAuditLogs((newLog) => {
      this.auditLogs.unshift(this.formatLogEntry(newLog));
    });
  }

  async fetchAuditLogs() {
    try {
      const { data, error } = await this.supabaseService.fetchAuditLogs();
      if (error) {
        console.error('Error fetching audit logs:', error);
        // Handle the error appropriately (e.g., show an error message to the user)
      } else if (data.length === 0) {
        console.warn('No audit logs found');
        this.auditLogs = [];
      } else {
        console.log('Fetched audit logs:', data);
        this.auditLogs = data.map(log => this.formatLogEntry(log));
      }
    } catch (error) {
      console.error('Unexpected error in fetchAuditLogs:', error);
      // Handle the error appropriately
    }
  }

  private formatLogEntry(log: any) {
    return {
      user_id: log.user_id,
      date: new Date(log.date).toLocaleString(),
      time: log.time,
      email: log.email || 'N/A',
      ip_address: log.ip_address || 'N/A',
      affected_page: log.affected_page || 'N/A',
      action: log.action || 'N/A',
      parameter: log.parameter || 'N/A',
      old_parameter: log.old_parameter || 'N/A',
      new_parameter: log.new_parameter || 'N/A'
    };
  }
}