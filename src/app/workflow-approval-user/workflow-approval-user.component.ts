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

  filteredApprovers: string[] = [];
  filteredReviewers: string[] = [];
  searchApprover: string = '';
  searchReviewer: string = '';
  selectedFile: File | null = null;
  allUsers: string[] = [];

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
    this.fetchAllUsers();
    this.fetchUserWorkflows();

  }

  async fetchAllUsers() {
    if (!this.supabase) {
      console.error('Supabase client is not initialized');
      return;
    }
    try {
      console.log('fetching all users...')
      const { data, error } = await this.supabase
        .from('profile')
        .select('first_name, surname')
  
      if (error) throw error;
  
      this.allUsers = data.map(user => `${user.first_name} ${user.surname}`);
      this.filteredApprovers = [...this.allUsers];
      this.filteredReviewers = [...this.allUsers];
      console.log('Fetched users:', this.allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
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
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError) throw new Error(`Authentication error: ${userError.message}`);
      if (!user) throw new Error('No authenticated user found');

      let fileName = '';
      // Upload file to bucket
      if (this.selectedFile) {
        const fileExt = this.selectedFile.name.split('.').pop();
        fileName = `${Math.random().toString(36).substring(2)}${Date.now().toString()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await this.supabase.storage
          .from('workflowproposals')
          .upload(filePath, this.selectedFile);

        if (uploadError) throw uploadError;
      }

      const workflowData = {
        ...this.newWorkflow,
        requested_by: user.email,
        status: 'Pending',
        request: fileName // Set the file name as the request
      };

      const { data, error } = await this.supabase
        .from('workflow')
        .insert([workflowData]);

      if (error) throw error;

      this.closeUploadModal();
      await this.fetchUserWorkflows();
      this.updatePaginatedWorkflows();
      alert('Workflow request submitted successfully!');
    } catch (error) {
      console.error('Error submitting workflow request:', error);
      alert('Error submitting workflow request. Please try again.');
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
    this.filteredApprovers = this.allUsers.filter(user =>
      user.toLowerCase().includes(this.searchApprover.toLowerCase())
    );
  }

  filterReviewers() {
    this.filteredReviewers = this.allUsers.filter(user =>
      user.toLowerCase().includes(this.searchReviewer.toLowerCase())
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
      this.newWorkflow.request = file.name; // Set the file name in the newWorkflow object
    }
  }
}