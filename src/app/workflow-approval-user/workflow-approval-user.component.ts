import { Component, OnInit } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-workflow-approval-user',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './workflow-approval-user.component.html',
  styleUrls: ['./workflow-approval-user.component.css']
})
export class WorkflowApprovalUserComponent implements OnInit {
  private supabase: SupabaseClient | undefined;
  userWorkflows: any[] = [];
  filteredWorkflows: any[] = [];
  paginatedWorkflows: any[] = [];
  showUploadModal = false;
  selectedStatus: string = '';
  searchTerm: string = '';
  currentPage: number = 1;
  totalPages: number = 1;
  itemsPerPage: number = 10;

  approvers: string[] = ['Approver 1', 'Approver 2', 'Approver 3'];
  reviewers: string[] = ['Reviewer 1', 'Reviewer 2', 'Reviewer 3'];
  filteredApprovers: string[] = [];
  filteredReviewers: string[] = [];
  searchApprover: string = '';
  searchReviewer: string = '';
  selectedFile: File | null = null;

  newWorkflow: any = {
    reviewer: '',
    submitted_for: '',
    request: '',
    requestType: ''
  };

  constructor(private router: Router) {
    console.log('Initializing Supabase client...');
    console.log('Supabase URL:', environment.supabaseUrl);
    console.log('Supabase Key:', environment.supabaseKey ? 'Provided' : 'Missing');
    
    this.initSupabase();
  }
  
  private initSupabase() {
    try {
      this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
      console.log('Supabase client initialized successfully');
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
      this.supabase = undefined;
    }
  }

  ngOnInit() {
    this.fetchUserWorkflows();
    this.filteredApprovers = [...this.approvers];
    this.filteredReviewers = [...this.reviewers];
  }

  async fetchUserWorkflows() {
    if (!this.supabase) {
      console.error('Supabase client is not initialized');
      return;
    }
  
    try {
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError) {
        console.error('User authentication error:', userError.message);
        throw userError;
      }
      if (!user) {
        throw new Error('No authenticated user found');
      }
  
      console.log('Fetching workflows for user:', user.email);
  
      const { data, error } = await this.supabase
        .from('workflow')
        .select('*')
        .eq('requested_by', user.email)
        .order('created_at', { ascending: false });
  
      if (error) {
        console.error('Supabase select error:', error.message);
        throw error;
      }
  
      console.log('Fetched workflows data:', data);
  
      this.userWorkflows = data || [];
      this.filterWorkflows();
      this.updatePaginatedWorkflows(); 
    } catch (error) {
      console.error('Error fetching workflows:', error);
    }
  }
  
  filterWorkflows() {
    this.filteredWorkflows = this.userWorkflows.filter(workflow =>
      (this.searchTerm ? 
        workflow.submitted_for.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        workflow.reviewer.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        workflow.request.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true
      ) && (this.selectedStatus ? workflow.status === this.selectedStatus : true)
    ); 
    this.currentPage = 1;
    this.updatePaginatedWorkflows();
  }

  updatePaginatedWorkflows() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedWorkflows = this.filteredWorkflows.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(this.filteredWorkflows.length / this.itemsPerPage);
  }

  async submitWorkflowRequest() {
    if (!this.supabase) {
      console.error('Supabase client is not initialized');
      alert('Error: Database connection not initialized');
      return;
    }

    try {
      console.log('Starting workflow submission...');

      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError) throw new Error(`Authentication error: ${userError.message}`);
      if (!user) throw new Error('No authenticated user found');

      console.log('User email:', user.email);

      const workflowData = {
        ...this.newWorkflow,
        requested_by: user.email,
      };
      console.log('Workflow data to be submitted:', workflowData);

      const { data, error } = await this.supabase
        .from('workflow')
        .insert([workflowData]);

      if (error) {
        console.error('Supabase error:', error.message);
        throw error;
      }

      console.log('Workflow submitted successfully:', data);

      this.closeUploadModal();
      await this.fetchUserWorkflows();
      this.updatePaginatedWorkflows();
      alert('Workflow request submitted successfully!');
    } catch (error) {
      console.error('Error submitting workflow request:', error);

      let errorMessage = 'Error submitting workflow request. ';
      if (error instanceof Error) {
        errorMessage += error.message;
        console.error('Error stack:', error.stack);
      } else {
        errorMessage += 'Please try again.';
      }

      alert(errorMessage);
    }
  }

  trackById(index: number, workflow: any) {
    return workflow.id;
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedWorkflows();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedWorkflows();  
    }
  }

  openUploadModal() {
    this.showUploadModal = true;
  }

  closeUploadModal() {
    this.showUploadModal = false;
    this.newWorkflow = {
      reviewer: '',
      submitted_for: '',
      request: '',
      requestType: ''
    };
    this.selectedFile = null;
  }

  goHome() {
    this.router.navigate(['/system-management']);
  }

  filterApprovers() {
    this.filteredApprovers = this.approvers.filter(approver =>
      approver.toLowerCase().includes(this.searchApprover.toLowerCase())
    );
  }

  filterReviewers() {
    this.filteredReviewers = this.reviewers.filter(reviewer =>
      reviewer.toLowerCase().includes(this.searchReviewer.toLowerCase())
    );
  }

  selectApprover(approver: string) {
    this.newWorkflow.submitted_for = approver;
  }

  selectReviewer(reviewer: string) {
    this.newWorkflow.reviewer = reviewer;
  }

  onFileSelected(event: Event) {
    const element = event.target as HTMLInputElement;
    const file = element.files ? element.files[0] : null;
    if (file) {
      this.selectedFile = file;
    }
  }
}