import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, PostgrestSingleResponse, PostgrestResponse } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  uploadPhoto(photoFile: any) {
    throw new Error('Method not implemented.');
  }
  private static instance: SupabaseService;
  private supabase!: SupabaseClient;
  private isLockAcquired = false;

  constructor() {
    if (SupabaseService.instance) {
      return SupabaseService.instance;
    }
    const supabaseUrl = environment.supabaseUrl;
    const supabaseKey = environment.supabaseKey;
    this.supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized with URL:', supabaseUrl);
    this.setupRealtimeSubscription(); // Setup the real-time subscription
    SupabaseService.instance = this;
  }

  // Automatically reload when the Supabase is updated
  private setupRealtimeSubscription(): void {
    this.supabase
      .channel('public:profile')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profile' }, payload => {
        console.log('Change received!', payload);
        this.handleDatabaseChange();
      })
      .subscribe();
  }

  private handleDatabaseChange(): void {
    // Handle the change (e.g., reload the page)
    window.location.reload();
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('profile')
      .select('email')
      .eq('email', email);

    if (error) {
      console.error('Error checking email:', error.message);
      return false;
    }

    return data.length > 0;
  }

  async createEmployee(employee: any): Promise<PostgrestSingleResponse<any>> {
    const response = await this.supabase.from('profile').insert([
      {
        email: employee.email,
        first_name: employee.firstname,
        mid_name: employee.midname,
        surname: employee.surname,
        password: employee.password, // Hash the password before storing
        department: employee.department,
        position: employee.position,
        types: employee.type
      },
    ]);

    if (response.error) {
      console.error('Error creating employee:', response.error.message);
    } else {
      console.log('Employee created successfully:', response.data);
    }

    return response;
  }

  async createRole(roleData: any): Promise<PostgrestSingleResponse<any>> {
    const response = await this.supabase.from('roles').insert([
      {
        role_name: roleData.role_name,
        department: roleData.department,
        mod_access: roleData.mod_access,
        rep_access: roleData.rep_access,
        data_access: roleData.data_access,
        privileges: roleData.privileges
      },
    ]);

    if (response.error) {
      console.error('Error creating role:', response.error.message);
    } else {
      console.log('Role created successfully:', response.data);
    }

    return response;
  }

  async createDepartment(departmentData: any): Promise<PostgrestSingleResponse<any>> {
    const response = await this.supabase.from('department').insert([
      {
        department_name: departmentData.department_name,
        mod_access: departmentData.mod_access,
        rep_access: departmentData.rep_access,
        data_access: departmentData.data_access,
        privileges: departmentData.privileges
      },
    ]);

    if (response.error) {
      console.error('Error creating department:', response.error.message);
    } else {
      console.log('Department created successfully:', response.data);
    }

    return response;
  }

  async getEmployees(): Promise<PostgrestResponse<any>> {
    const response = await this.supabase.from('profile').select('');
    if (response.error) {
      console.error('Error fetching employees:', response.error.message);
    }
    return response;
  }

  async deleteUser(email: string): Promise<PostgrestSingleResponse<any>> {
    const response = await this.supabase
      .from('profile')
      .delete()
      .eq('email', email);

    if (response.error) {
      console.error('Error deleting user:', response.error.message);
    } else {
      console.log('User deleted successfully:', response.data);
    }

    return response;
  }

  async acquireLock(): Promise<boolean> {
    if (this.isLockAcquired) {
      console.warn('Lock is already acquired');
      return false;
    }
    try {
      console.log('Acquiring lock...');
      this.isLockAcquired = true;
      return true;
    } catch (error) {
      console.error('Failed to acquire lock', error);
      return false;
    }
  }

  releaseLock(): void {
    console.log('Releasing lock...');
    this.isLockAcquired = false;
  }

  async authenticateUser(email: string, password: string): Promise<any> {
    console.log('Authenticating user with email:', email);

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Authentication error:', error.message);
      console.debug('Request details:', { email, password });
    } else {
      console.log('User authenticated:', data);
    }

    return { data, error };
  }

  async updateEmployee(employee: any): Promise<PostgrestSingleResponse<any>> {
    const response = await this.supabase
      .from('profile')
      .update({
        first_name: employee.firstname,
        mid_name: employee.midname,
        password: employee.password,
        surname: employee.surname,
        department: employee.department,
        position: employee.position,
        types: employee.type
      })
      .eq('email', employee.email);

    if (response.error) {
      console.error('Error updating employee:', response.error.message);
    } else {
      console.log('Employee updated successfully:', response.data);
    }

    return response;
  }

  async getWorkflows() {
    const { data, error } = await this.supabase
      .from('workflow')
      .select('*');

    if (error) {
      console.error('Error fetching workflows:', error);
      return [];
    }

    return data;
  }

  // Fetch tickets from the database
  async getTickets() {
    const { data, error } = await this.supabase
      .from('ticket')
      .select('*')
      .order('dateTime', { ascending: false });
    if (error) {
      console.error('Error fetching tickets:', error);
      return { data: [], error };
    }
    return { data, error };
  }

  async uploadImage(file: File): Promise<{ data: { url: string } | null, error: Error | null }> {
    console.log('Uploading image...');
    try {
      const { data, error } = await this.supabase.storage
        .from('photos') // Replace with your Supabase storage bucket name
        .upload(`employimages/${file.name}`, file, {
          contentType: file.type
        });

      if (error) {
        console.error('Error during upload:', error.message);
        return { data: null, error };
      }

      console.log('Upload successful:', data);

      // Constructing the URL assuming the structure of the response
      const url = data?.path ? `https://${environment.supabaseUrl}/storage/v1/object/public/${data.path}` : '';

      return { data: { url }, error: null };
    } catch (error) {
      console.error('Unexpected error during upload:', error);
      return { data: null, error: error as Error };
    }
  }

  async setStoragePolicy(): Promise<boolean> {
    try {
      const supabaseAny = this.supabase as any; // Cast supabase to any temporarily
      const { data, error } = await supabaseAny.storage
        .from('photos')
        .createPolicy({
          path: '*',
          public: false, // Set to true if you want files to be publicly accessible
          cacheControl: '3600', // Cache control settings in seconds
          contentType: 'image/jpeg,image/png', // Allowed content types
          expiration: '2024-12-31T00:00:00Z', // Expiration date for access
          actions: ['read', 'write'], // Allowed actions: read, write
          roles: ['authenticated'], // Roles that can access (e.g., authenticated users)
        });

      if (error) {
        console.error('Error setting storage policy:', error);
        return false;
      }

      console.log('Storage policy set successfully:', data);
      return true;
    } catch (error) {
      console.error('Failed to set storage policy:', error);
      return false;
    }
  }
}