import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient, User, Session, PostgrestSingleResponse, PostgrestResponse } from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';


interface Ticket {
  id: number;
  // Add other fields as per your ticket structure
  status: string; // Assuming 'status' is a field in your ticket table
  adminViewedDateTime?: Date; // Optional field indicating when admin viewed/opened the ticket
}

@Injectable({
  providedIn: 'root',
})

export class SupabaseService {
  //uploadFile: any;
  uploadPhoto(photoFile: any) {
    throw new Error('Method not implemented.');
  }
  private static instance: SupabaseService;
  private supabase!: SupabaseClient;
  private isLockAcquired = false;
  private currentUser = new BehaviorSubject<User | null>(null);
  private currentSession = new BehaviorSubject<Session | null>(null);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    const supabaseUrl = environment.supabaseUrl;
    const supabaseKey = environment.supabaseKey;
    this.supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized with URL:', supabaseUrl);
    if (isPlatformBrowser(this.platformId)) {
      this.setupRealtimeSubscription();
      this.loadUserAndSession();
    }
  }

  private async loadUserAndSession() {
    const { data: { user }, error: userError } = await this.supabase.auth.getUser();
    if (!userError && user) {
      this.currentUser.next(user);
      const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
      if (!sessionError && session) {
        this.currentSession.next(session);
      }
    }
  }

  async getEmployeeNames() {
    let { data, error } = await this.supabase
      .from('profile')
      .select('first_name, mid_name, surname');

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser.asObservable();
  }

  getCurrentSession(): Observable<Session | null> {
    return this.currentSession.asObservable();
  }

  async isAuthenticated(): Promise<boolean> {
    const session = await this.supabase.auth.getSession();
    return !!session.data.session;
  }

  async signIn(email: string, password: string): Promise<boolean> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Sign in error:', error);
      return false;
    }
    this.currentUser.next(data.user);
    this.currentSession.next(data.session);
    return true;
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }


  async refreshSession(): Promise<void> {
    const { data, error } = await this.supabase.auth.refreshSession();
    if (error) {
      console.error('Failed to refresh session:', error);
    } else if (data.session) {
      this.currentSession.next(data.session);
      this.currentUser.next(data.session.user);
    }
  }

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
    if (isPlatformBrowser(this.platformId)) {
      window.location.reload();
    } else {
      console.log('Database change detected, but not in browser environment');
    }
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

  async createEmployee(employeeData: any): Promise<{ data: any; error: any }> {
    console.log('SupabaseService received employee data:', employeeData);
  
    try {
      // Log the exact data being inserted
      console.log('Data to insert:', employeeData);
  
      const { data, error } = await this.supabase
        .from('profile')
        .insert([employeeData])
        .select();
  
      if (error) {
        console.error('Supabase insert error:', error);
        return { data: null, error };
      }
  
      if (!data || data.length === 0) {
        console.error('No data returned from Supabase insert');
        return { data: null, error: new Error('No data returned from insert') };
      }
  
      console.log('Supabase insert successful:', data);
      return { data: data[0], error: null };
    } catch (error) {
      console.error('Error in createEmployee:', error);
      return { data: null, error };
    }
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
    try {
      const response = await this.supabase
        .from('profile')
        .delete()
        .eq('email', email);
  
      if (response.error) {
        console.error('Error deleting user:', response.error.message);
      } else {
        console.log('User deleted successfully:', response.data);
        // Refresh the session after the delete operation
        await this.refreshSession();
      }
  
      return response;
    } catch (error) {
      console.error('Unexpected error deleting user:', error);
      // Create a PostgrestSingleResponse-like object for unexpected errors
      return {
        data: null,
        error: error as any,
        count: null,
        status: 500,
        statusText: 'Internal Server Error'
      };
    }
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
      await this.refreshSession();
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

async uploadFile(bucket: string, fileName: string, file: File): Promise<{ data: { path: string } | null, error: Error | null }> {
    console.log('Uploading file...');
    try {
      const { data, error } = await this.supabase.storage
        .from('photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          contentType: file.type,
          upsert: false
        });

      if (error) {
        console.error('Error during upload:', error.message);
        return { data: null, error };
      }

      console.log('Upload successful:', data);
      return { data: { path: data.path }, error: null };
    } catch (error) {
      console.error('Unexpected error during upload:', error);
      return { data: null, error: error as Error };
    }
  }

  async getPhotoUrl(employeeId: string): Promise<string | null> {
    try {
      // Ensure employeeId is not undefined and can be converted to a number
      if (!employeeId || isNaN(Number(employeeId))) {
        console.warn(`Invalid employee ID: ${employeeId}`);
        return null;
      }
  
      const numericEmployeeId = BigInt(employeeId);
  
      console.log('Fetching photo URL for employee ID:', numericEmployeeId.toString());
  
      const { data, error } = await this.supabase
        .from('profile')
        .select('photo_url')
        .eq('user_id', numericEmployeeId.toString())
        .single();
  
      if (error) {
        console.error('Error fetching photo URL:', error.message);
        return null;
      }
  
      if (!data || !data.photo_url) {
        console.warn(`No photo URL found for employee ID: ${numericEmployeeId.toString()}`);
        return null;
      }
  
      console.log(`Photo URL fetched for employee ID ${numericEmployeeId.toString()}:`, data.photo_url);
      return data.photo_url;
    } catch (error) {
      console.error('Unexpected error fetching photo URL:', error);
      return null;
    }
  }

  async updateProfile(email: string, photoUrl: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('profile')
      .update({ photo_url: photoUrl }) // Assuming 'photo_url' is the column name for the photo URL
      .eq('email', email);

    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }

    return data;
  }
  
  async setStoragePolicy(): Promise<boolean> {
    try {
      const supabaseAny = this.supabase as any; // Cast supabase to any temporarily
      const { data, error } = await supabaseAny.storage
        .from('photos')
        .updateBucket('photos', {
          public: false, // Set to true if you want files to be publicly accessible
          cacheControl: '3600', // Cache control settings in seconds
          allowedMimeTypes: ['image/jpeg', 'image/png'], // Allowed content types
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