import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../Supabase/supabase.service';

interface AuditLog {
  id?: number;
  user_id: string;  // Changed from 'user' to 'user_id'
  action?: string;
  affected_page?: string;
  parameter?: string;
  old_value?: string;
  new_value?: string;
  ip_address?: string;
  date?: string;
}

@Component({
  selector: 'app-audit-trail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-trail.component.html',
  styleUrls: ['./audit-trail.component.css']
})
export class AuditTrailComponent implements OnInit {
  auditLogs: AuditLog[] = [];

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.fetchAuditLogs();
  }

  async fetchAuditLogs() {
    try {
      const logs = await this.supabaseService.fetchAuditLogs();
      console.log('Fetched audit logs:', logs);
      this.auditLogs = logs.map(log => ({
        ...log,
        user_id: log.user_id || 'Unknown User',
        action: log.action || 'Unknown Action',
        affected_page: log.affected_page || 'N/A',
        parameter: log.parameter || 'N/A',
        old_value: log.old_value || 'N/A',
        new_value: log.new_value || 'N/A',
        ip_address: log.ip_address || 'N/A',
      }));
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      this.auditLogs = [];
    }
  }

  async logAction(action: string, affectedPage: string, parameter: string, oldValue: string, newValue: string) {
    try {
      const ipAddress = await this.getIpAddress();
      const userId = await this.getCurrentUserId();

      await this.supabaseService.logAction({
        user_id: userId,  // Changed from 'user' to 'user_id'
        action,
        affected_page: affectedPage,
        parameter,
        old_value: oldValue,
        new_value: newValue,
        ip_address: ipAddress
      });

      // Refresh the audit logs after logging a new action
      await this.fetchAuditLogs();
    } catch (error) {
      console.error('Error logging action:', error);
      // Handle the error appropriately
    }
  }

  private async getIpAddress(): Promise<string> {
    // Implement logic to get the user's IP address
    return 'User IP';
  }

  private async getCurrentUserId(): Promise<string> {
    // Implement logic to get the current user's ID
    return 'User ID';
  }

  goHome() {
    this.router.navigate(['/system-management']);
  }
}