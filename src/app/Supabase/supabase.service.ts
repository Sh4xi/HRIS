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

  private databaseChangeSubject = new BehaviorSubject<boolean>(false);
  public databaseChange$ = this.databaseChangeSubject.asObservable();

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

  async getRoles() {
    const { data, error } = await this.supabase
      .from('roles')
      .select('role_name, role_id');
  
    if (error) {
      throw error;
    }
  
    return data;
  }
  
  async getAssignedEmployees(roleId: number): Promise<any> {
    const { data, error } = await this.supabase
      .from('user_roles')
      .select('user_id')
      .eq('role_id', roleId);

    if (error) {
      return { data: null, error };
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
    // if (isPlatformBrowser(this.platformId)) {
    //   window.location.reload();
    // } else {
    //   console.log('Database change detected, but not in browser environment');
    // }
    this.databaseChangeSubject.next(true);
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

<<<<<<< HEAD
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
    ]).select('user_id');

  // Step 2: Handle potential errors in the employee creation process
  if (response.error) {
    console.error('Error creating employee:', response.error.message);
    return response; // Return early if there was an error
  } else {
    console.log('Employee created successfully:', response.data);
    const newUserId = response.data[0].user_id;
  
    // Step 3: Fetch the corresponding role_id for the role_name
    const { data: rolesData, error: rolesError } = await this.supabase
      .from('roles')
      .select('role_id')
      .eq('role_name', employee.position)
      .single();

    // Step 4: Handle potential errors in fetching the role_id
    if (rolesError) {
      console.error('Error fetching role_id:', rolesError.message);
      return { data: null, error: rolesError } as PostgrestSingleResponse<any>; // Return early if there was an error
    }

    const roleId = rolesData.role_id;

    // Step 5: Assign role to the user and store role_name
    const assignRoleResponse = await this.assignUserRole(newUserId, roleId);

    // Step 6: Handle potential errors in the role assignment process
    if (assignRoleResponse.error) {
      console.error('Error assigning role:', assignRoleResponse.error.message);
    } else {
      console.log('Role assigned successfully:', assignRoleResponse.data);
    }

    // Step 7: Refresh the session
    await this.refreshSession();
  }

  return response;
  }

  async assignUserRole(userId: number, roleId: number): Promise<PostgrestSingleResponse<any>> {
    const response = await this.supabase
      .from('user_roles')
      .insert({ user_id: userId, role_id: roleId });
  
    if (response.error) {
      console.error('Error assigning role:', response.error.message);
    }
  
    return response;
=======
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
>>>>>>> upload_photo_branch13
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



  async deleteTicket(ticketId: number) {
    return await this.supabase
      .from('ticket')
      .delete()
      .eq('id', ticketId);
  }

<<<<<<< HEAD
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
=======
  async uploadFile(bucket: string, fileName: string, file: File): Promise<{ data: { path: string, publicUrl: string } | null, error: Error | null }> {
    console.log('Uploading file...');
>>>>>>> upload_photo_branch13
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
  async fetchAuditLogs() {
    const { data, error } = await this.supabase
      .from('audit_trail')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }

    return data;
  }

  async logAction(Email: number, action: string) {
    const { error } = await this.supabase
      .from('auth_user')
      .insert([{ Email: Email, action }]);
  
    if (error) {
      console.error('Error logging action:', error.message);
      throw error;
    }
  }
  

  //parameters
  async getParameters() {
    const { data, error } = await this.supabase
      .from('parameters')
      .select('*');
    if (error) throw error;
    console.log('Fetched data from Supabase:', data);
    return data;
  }
  
  async createParameter(parameter: any) {
    const { data, error } = await this.supabase
      .from('parameters')
      .insert(parameter);
    if (error) throw error;
    return data;
  }

  async deleteParameter(parameterName: string): Promise<void> {
    const { error } = await this.supabase
      .from('parameters')
      .delete()
      .eq('parameter_name', parameterName);
  
    if (error) {
      throw error;
    }
  }

  async updateParameter(parameter: any) {
    const { data, error } = await this.supabase
      .from('parameters') // Replace 'parameters' with your actual table name
      .update({
        parameter_name: parameter.parameter_name,
        parameter_type: parameter.parameter_type,
        parameter_date: parameter.parameter_date,
        parameter_time: parameter.parameter_time,
        parameter_time2: parameter.parameter_time2
        // Add any other fields that your parameter object has
      })
      .eq('id', parameter.id); // Assuming 'id' is the unique identifier

    if (error) {
      throw error;
    }

    return data;
  }
}