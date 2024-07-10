import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, PostgrestSingleResponse, PostgrestResponse } from '@supabase/supabase-js';
import { environment } from '../environments/environment';



@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  
  async deleteUser(email: string): Promise<PostgrestSingleResponse<any>> {
  const response = await this.supabase
    .from('Profile')
    .delete()
    .eq('email', email);

  if (response.error) {
    console.error('Error deleting user:', response.error.message);
  } else {
    console.log('User deleted successfully:', response.data);
  }

  return response;
}
  private supabase: SupabaseClient;
  private isLockAcquired = false;

  constructor() {
    const supabaseUrl = environment.supabaseUrl;
    const supabaseKey = environment.supabaseKey;
    this.supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized with URL:svf', supabaseUrl);
    this.setupRealtimeSubscription(); // Setup the real-time subscription
  }
// automatically reload when the supabase is updated
  private setupRealtimeSubscription(): void {
    this.supabase
      .channel('public:Profile')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Profile' }, payload => {
        console.log('Change received!', payload);
        this.handleDatabaseChange();
      })
      .subscribe();
  }

  private handleDatabaseChange(): void {
    // Handle the change (e.g., reload the page)
    window.location.reload();
  }
  

  async createEmployee(employee: any): Promise<PostgrestSingleResponse<any>> {
    const response = await this.supabase.from('Profile').insert([
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
  

  async getEmployees(): Promise<PostgrestResponse<any>> {
    const response = await this.supabase.from('Profile').select('');
    if (response.error) {
      console.error('Error fetching employees:', response.error.message);
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
      .from('Profile')
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
}

