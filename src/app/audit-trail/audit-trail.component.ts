import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../Supabase/supabase.service';

@Component({
  selector: 'app-audit-trail',
  standalone: true,
  imports: [CommonModule],  // Import CommonModule here
  templateUrl: './audit-trail.component.html',
  styleUrls: ['./audit-trail.component.css']
})
export class AuditTrailComponent {
  auditLogs: any[] = [];

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    const rawLogs = await this.supabaseService.getAuditLogs();
    this.auditLogs = rawLogs.map(log => ({
      ...log,
      user: 'Some User',  // Replace with actual user fetching logic if available
      ip_address: '127.0.0.1',  // Replace with actual IP if available
      affected_page: 'User Management',  // Replace with actual affected page if available
      parameter: 'N/A',  // Replace with actual parameter if available
      old_value: 'N/A',  // Replace with actual old value if available
      new_value: 'N/A',  // Replace with actual new value if available
    }));
  }
}

