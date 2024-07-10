import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule],
  templateUrl: './workflow-approval.component.html',
  styleUrls: ['./workflow-approval.component.css']
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

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async ngOnInit() {
    await this.fetchWorkflows();
  }

  async fetchWorkflows() {
    const { data, error } = await this.supabase
      .from('workflows')
      .select('*')
      .range((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage - 1);

    if (error) {
      console.error('Error fetching workflows:', error);
    } else {
      this.workflows = data || [];
      this.filterWorkflows();
    }

    const { count } = await this.supabase
      .from('workflows')
      .select('*', { count: 'exact', head: true });

    this.totalPages = Math.ceil((count || 0) / this.itemsPerPage);
  }

  filterWorkflows() {
    this.filteredWorkflows = this.workflows.filter(workflow => {
      const matchesStatus = !this.selectedStatus || workflow.status === this.selectedStatus;
      const matchesSearch = !this.searchTerm || 
        Object.values(workflow).some(value => 
          value.toString().toLowerCase().includes(this.searchTerm.toLowerCase())
        );
      return matchesStatus && matchesSearch;
    });
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
}