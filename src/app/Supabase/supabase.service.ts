import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, PostgrestSingleResponse,PostgrestResponse } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private isLockAcquired = false;

  constructor() {
    const supabaseUrl = environment.supabaseUrl;
    const supabaseKey = environment.supabaseKey;
    this.supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized with URL:', supabaseUrl);
  }

  async createEmployee(employee: any): Promise<PostgrestSingleResponse<any>> {
    const response = await this.supabase.from('Profile').insert([
      {
        email: employee.email,
        first_name: employee.firstname,
        mid_name: employee.midname,
        surname: employee.surname,
        password: 'hashed_password_placeholder', // Hash the password before storing
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
    const response = await this.supabase.from('Profile').select('*');
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
}
