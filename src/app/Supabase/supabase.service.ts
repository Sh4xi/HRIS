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

interface AuditLogEntry {
  user_id: string;
  action: string;
  affected_page: string;
  parameter: string;
  old_value: string;
  new_value: string;
  ip_address: string;
  date?: string;
  email?: string;
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

  
  
  async createRole(roleData: any): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('roles')
        .insert([roleData])
        .select();
  
      if (error) {
        console.error('Error creating role:', error.message);
        return { data: null, error };
      }
  
      console.log('Role created successfully:', data);
      return { data: data[0], error: null };
    } catch (error) {
      console.error('Unexpected error creating role:', error);
      return { data: null, error };
    }
  }
  
  async createDepartment(departmentData: any): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('department')
        .insert([departmentData])
        .select();
  
      if (error) {
        console.error('Error creating department:', error.message);
        return { data: null, error };
      }
  
      console.log('Department created successfully:', data);
      return { data: data[0], error: null };
    } catch (error) {
      console.error('Unexpected error creating department:', error);
      return { data: null, error };
    }
  }
  
  async getEmployees(): Promise<{ data: any[]; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('profile')
        .select('*');
  
      if (error) {
        console.error('Error fetching employees:', error.message);
        return { data: [], error };
      }
  
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error fetching employees:', error);
      return { data: [], error };
    }
  }
  
  async deleteUser(email: string): Promise<{ success: boolean; error: any }> {
    try {
      // Retrieve the user's profile to get the image path
      // Get the old user data before deletion
    const { data: oldUserData, error: oldDataError } = await this.supabase
    .from('profile')
    .select('*')
    .eq('email', email)
    .single();

  if (oldDataError) {
    console.error('Error retrieving old user data:', oldDataError.message);
    return { success: false, error: oldDataError };
  }

  // Delete the user profile
  const { error: deleteError } = await this.supabase
    .from('profile')
    .delete()
    .eq('email', email);

  if (deleteError) {
    console.error('Error deleting user:', deleteError.message);
    return { success: false, error: deleteError };
  }

  // Create audit log
  await this.createAuditLog({
    user_id: await this.getCurrentUserId(),
    affected_page: 'User Management',
    action: 'Delete',
    old_parameter: JSON.stringify(oldUserData),
    new_parameter: null
  });

  console.log('User deleted successfully');

  // Refresh the session after the delete operation
  await this.refreshSession();

  return { success: true, error: null };
} catch (error) {
  console.error('Unexpected error deleting user:', error);
  return { success: false, error };
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

//new code for audit
async createAuditLog(logData: any) {
  console.log('Attempting to create audit log:', logData);

  // Check for required fields
  const requiredFields = ['email', 'affected_page', 'action'];
  for (const field of requiredFields) {
    if (!logData[field]) {
      const error = `Missing required field for audit log: ${field}`;
      console.error(error);
      return { success: false, error };
    }
  }

  try {
    const currentDate = new Date();
    const auditLogEntry = {
      date: currentDate,
      time: currentDate.toTimeString().split(' ')[0],
      email: logData.email,
      ip_address: await this.getUserIpAddress(),
      affected_page: logData.affected_page,
      action: logData.action,
      parameter: logData.parameter || null,
      old_parameter: logData.old_parameter || null,
      new_parameter: logData.new_parameter || null
    };

    console.log('Prepared audit log entry:', auditLogEntry);

    const { data, error } = await this.supabase
      .from('audit_trail')
      .insert(auditLogEntry)
      .select();

    if (error) {
      console.error('Supabase error creating audit log:', error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      console.error('No data returned from Supabase after inserting audit log');
      return { success: false, error: 'No data returned from insert operation' };
    }

    console.log('Audit log created successfully:', data[0]);
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Unexpected error in createAuditLog:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

subscribeToAuditLogs(callback: (payload: any) => void) {
  return this.supabase
    .channel('audit_trail_changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'audit_trail' },
      (payload) => {
        console.log('New audit log:', payload.new);
        callback(payload.new);
      }
    ) 
    .subscribe((status) => {
      console.log('Subscription status:', status);
    });
}
async isAuditTrailEmpty(): Promise<boolean> {
  const { count, error } = await this.supabase
    .from('audit_trail')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error checking if audit_trail is empty:', error);
    return true;
  }

  return count === 0;
}
  async updateEmployee(employee: any): Promise<{ data: any; error: any }> {
    try {
      // Get the old employee data before update
      const { data: oldEmployeeData, error: oldDataError } = await this.supabase
        .from('profile')
        .select('*')
        .eq('email', employee.email)
        .single();
  
      if (oldDataError) {
        console.error('Error retrieving old employee data:', oldDataError.message);
        return { data: null, error: oldDataError };
      }
  
      const { data, error } = await this.supabase
        .from('profile')
        .update({
          first_name: employee.first_name,
          mid_name: employee.mid_name,
          surname: employee.surname,
          password: employee.password,
          department: employee.department,
          position: employee.position,
          types: employee.types,
          photo_url: employee.photo_url
        })
        .eq('email', employee.email)
        .select();
  
      if (error) {
        console.error('Error updating employee:', error.message);
        return { data: null, error };
      }
  
      // Create audit log
      await this.createAuditLog({
        user_id: await this.getCurrentUserId(),
        affected_page: 'Employee Management',
        action: 'Update',
        old_parameter: JSON.stringify(oldEmployeeData),
        new_parameter: JSON.stringify(data[0])
      });
  
      console.log('Employee updated successfully:', data);
      await this.refreshSession();
  
      return { data: data[0], error: null };
    } catch (error) {
      console.error('Unexpected error updating employee:', error);
      return { data: null, error };
    }
  }
  async createEmployee(employeeData: any): Promise<{ data: any; error: any }> {
    console.log('Creating employee:', JSON.stringify(employeeData, null, 2));
    try {
      const { data, error } = await this.supabase
        .from('profile')
        .insert([employeeData])
        .select();
  
      if (error) {
        console.error('Error creating employee:', error);
        return { data: null, error };
      }
  
      console.log('Employee created successfully:', JSON.stringify(data, null, 2));
  
      // Create audit log
      const auditLogData: AuditLogEntry = {
        user_id: await this.getCurrentUserId(),
        action: 'Create',
        affected_page: 'Employee Management',
        parameter: 'New employee created',
        old_value: '',  // No old value for a new employee
        new_value: JSON.stringify(data[0]),
        ip_address: await this.getUserIpAddress(),
        date: new Date().toISOString(),
        email: await this.getCurrentUserEmail()
      };
  
      console.log('Audit log data being sent:', JSON.stringify(auditLogData, null, 2));
  
      const auditLogResult = await this.createAuditLog(auditLogData);
      if (!auditLogResult.success) {
        console.error('Failed to create audit log:', auditLogResult.error);
      } else {
        console.log('Audit log created successfully:', JSON.stringify(auditLogResult.data, null, 2));
      }
  
      return { data: data[0], error: null };
    } catch (error) {
      console.error('Unexpected error in createEmployee:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  // Method to get the current user's email
  async getCurrentUserEmail(): Promise<string> {
    const { data, error } = await this.supabase.auth.getSession();
    if (error) {
      throw new Error('Error getting session: ' + error.message);
    }
    if (data.session && data.session.user) {
        return data.session.user.id;
      } else {
        throw new Error('No user is currently logged in.');
      }
  }
  

  // Example implementation of getCurrentUserId
  async getCurrentUserId(): Promise<string> {
    const { data, error } = await this.supabase.auth.getSession();
    if (error) {
      throw new Error('Error getting session: ' + error.message);
    }
    if (data.session) {
      return data.session.user.id;
    } else {
      throw new Error('No user is currently logged in.');
    }
  }

  // Example implementation of getUserIpAddress (needs to be defined)
  async getUserIpAddress(): Promise<string> {
    // This method should be implemented to return the user's IP address
    return '127.0.0.1';
  }
  
  // // Helper method to get current user ID
  // async getCurrentUserId(): Promise<string> {
  //   const { data: { user } } = await this.supabase.auth.getUser();
  //   return user?.id || 'Unknown';
  // }

  
  async getWorkflows(): Promise<{ data: any[]; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('workflow')
        .select('*');
  
      if (error) {
        console.error('Error fetching workflows:', error.message);
        return { data: [], error };
      }
  
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error fetching workflows:', error);
      return { data: [], error };
    }
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

  async uploadFile(bucket: string, fileName: string, file: File): Promise<{ data: { path: string, publicUrl: string } | null, error: Error | null }> {
    console.log('Uploading file...');
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
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
  
      // Get the public URL for the uploaded file
      const { data: publicUrlData } = this.supabase
        .storage
        .from(bucket)
        .getPublicUrl(data.path);
  
      if (!publicUrlData || !publicUrlData.publicUrl) {
        return { data: null, error: new Error('Failed to get public URL') };
      }
  
      console.log('Public URL:', publicUrlData.publicUrl);
  
      return { 
        data: { 
          path: data.path,
          publicUrl: publicUrlData.publicUrl
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Unexpected error during upload:', error);
      return { data: null, error: error as Error };
    }
  }


  async updateProfilePhotoUrl(employeeId: string, photoUrl: string): Promise<{ data: any | null, error: Error | null }> {
    try {
      // Ensure employeeId is not undefined and can be converted to a number
      if (!employeeId || isNaN(Number(employeeId))) {
        console.error(`Invalid employee ID: ${employeeId}`);
        return { data: null, error: new Error('Invalid employee ID') };
      }
  
      console.log(`Updating photo URL for employee ID: ${employeeId}`);
      console.log(`New photo URL: ${photoUrl}`);
  
      const { data, error } = await this.supabase
        .from('profile')
        .update({ photo_url: photoUrl })
        .eq('id', employeeId)
        .single();
  
      if (error) {
        console.error('Error updating profile photo URL:', error);
        //return { data: null, error };
      }
  
      if (!data) {
        console.warn(`No data returned when updating photo URL for employee ID: ${employeeId}`);
        return { data: null, error: new Error('No data returned from update operation') };
      }
  
      console.log(`Successfully updated photo URL for employee ID ${employeeId}`);
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error updating profile photo URL:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error occurred') };
    }
  }

  async getPhotoUrl(employeeId: string): Promise<string | null> {
    try {
        console.log('Fetching photo URL for employee ID:', employeeId);

        const { data, error } = await this.supabase
            .from('profile')
            .select('photo_url')
            .eq('email', employeeId)  // Assuming 'email' is the correct column name for email addresses
            .single();

        if (error) {
            console.error('Error fetching photo URL:', error.message);
            return null;
        }

        if (!data || !data.photo_url) {
            console.warn(`No photo URL found for employee ID: ${employeeId}`);
            return null;
        }

        console.log(`Photo URL fetched for employee ID ${employeeId}:`, data.photo_url);
        return data.photo_url;
    } catch (error) {
        console.error('Unexpected error fetching photo URL:', error);
        return null;
    }
}

async logAction(logEntry: AuditLogEntry): Promise<void> {
  const { data, error } = await this.supabase
    .from('audit_trail')
    .insert([logEntry]);
  
  if (error) {
    console.error('Error logging action:', error.message);
    throw error;
  }

  console.log('Action logged successfully:', data);
}



// Your existing fetchAuditLogs method
async fetchAuditLogs(): Promise<{ data: any[]; error: any }> {
  console.log('Fetching audit logs from Supabase...');
  try {
    const { data, error } = await this.supabase
      .from('audit_trail')
      .select('*')
      .order('date', { ascending: false })
      .order('time', { ascending: false });

    if (error) {
      console.error('Supabase error fetching audit logs:', error);
      return { data: [], error };
    }

    console.log('Raw audit logs data from Supabase:', JSON.stringify(data, null, 2));
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Unexpected error in fetchAuditLogs:', error);
    return { data: [], error };
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