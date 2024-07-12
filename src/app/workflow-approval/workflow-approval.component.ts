import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

interface Workflow {
  id: number;
  status: string;
  submitted_for: string;
  submitted_for_role: string;
  reviewer: string;
  request: string;
  requested_by: string;
  requested_by_role: string;
}

@Component({
  selector: 'app-workflow',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './workflow-approval.component.html',
  styleUrls: ['./workflow-approval.component.css'],
})
export class WorkflowComponent implements OnInit {
  private supabase: SupabaseClient;
  workflows: Workflow[] = [];
  filteredWorkflows: Workflow[] = [];
  selectedStatus: string = '';
  searchTerm: string = '';
  currentPage: number = 1;
  totalPages: number = 1;
  itemsPerPage: number = 10;

  constructor(private router: Router) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async ngOnInit() {
    await this.fetchWorkflows();
  }

  async fetchWorkflows() {
    const { data, error } = await this.supabase
      .from('workflow')
      .select('*')
      .range((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage - 1);

    if (error) {
      console.error('Error fetching workflows:', error);
    } else {
      this.workflows = data?.map(item => ({
        id: item.id,
        status: item.status, // Assuming the column name is 'status' in your table
        submitted_for: item.submitted_for,
        submitted_for_role: item.submitted_for_role,
        reviewer: item.reviewer,
        request: item.request,
        requested_by: item.requested_by,
        requested_by_role: item.requested_by_role
      })) || [];
      this.filterWorkflows();
    }

    const { count } = await this.supabase
      .from('workflow')
      .select('*', { count: 'exact', head: true });

    this.totalPages = Math.ceil((count || 0) / this.itemsPerPage);
    console.log('Total pages:', this.totalPages);
  }

  filterWorkflows() {
    console.log('Filtering workflows. Before:', this.workflows.length);
    this.filteredWorkflows = this.workflows.filter(workflow => {
      const matchesStatus = !this.selectedStatus || workflow.status === this.selectedStatus;
      const matchesSearch = !this.searchTerm || 
        Object.values(workflow).some(value => 
          value && value.toString().toLowerCase().includes(this.searchTerm.toLowerCase())
        );
      return matchesStatus && matchesSearch;
    });
    console.log('After filtering:', this.filteredWorkflows.length);
  }

  async previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      await this.fetchWorkflows();
    }
  }

  async nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      await this.fetchWorkflows();
    }
  }

  goHome() {
    this.router.navigate(['/system-management']);
  }
}