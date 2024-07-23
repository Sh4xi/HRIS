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
  private databaseChangeSubject = new BehaviorSubject<boolean>(false);
  public databaseChange$ = this.databaseChangeSubject.asObservable();
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
      .select('user_id, first_name, mid_name, surname');
  
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

  async createEmployee(employee: any): Promise<{ data: any; error: any }> {
    console.log('Creating employee:', JSON.stringify(employee, null, 2));
  
    // Step 1: Insert the employee data into the 'profile' table
    const { data: profileData, error: profileError } = await this.supabase
      .from('profile')
      .insert([{
        email: employee.email,
        first_name: employee.first_name,
        mid_name: employee.mid_name,
        surname: employee.surname,
        password: employee.password, // Hash the password before storing
        department: employee.department,
        position: employee.position,
        types: employee.types,
        access: employee.access,
        photo_url: employee.photo_url
      }])
      .select('user_id');
  
    if (profileError) {
      console.error('Error creating employee:', profileError.message);
      return { data: null, error: profileError };
    }
  
    const newUserId = profileData[0].user_id;
    console.log('Employee created successfully:', JSON.stringify(profileData, null, 2));
  
    // Step 2: Fetch the corresponding role_id for the role_name
    const { data: rolesData, error: rolesError } = await this.supabase
      .from('roles')
      .select('role_id')
      .eq('role_name', employee.position)
      .single();
  
    if (rolesError) {
      console.error('Error fetching role_id:', rolesError.message);
      return { data: null, error: rolesError };
    }
  
    const roleId = rolesData.role_id;
  
    // Step 3: Assign role to the user and store role_name
    const assignRoleResponse = await this.assignUserRole(newUserId, roleId);
  
    if (assignRoleResponse.error) {
      console.error('Error assigning role:', assignRoleResponse.error.message);
      return { data: profileData[0], error: assignRoleResponse.error };
    } else {
      console.log('Role assigned successfully:', assignRoleResponse.data);
    }
  
    // Step 4: Create an audit log entry
    const auditLogData: AuditLogEntry = {
      user_id: await this.getCurrentUserId(),
      action: 'Create',
      affected_page: 'Employee Management',
      parameter: 'New employee created',
      old_value: '',  // No old value for a new employee
      new_value: JSON.stringify(profileData[0]),
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
  
    // Step 5: Refresh the session
    await this.refreshSession();
  
    return { data: profileData[0], error: null };
  }
  

  //Writes in the "user_roles" table in Supabase. Relates a user_id to an assigned role_id
  async assignUserRole(userId: number, roleId: number): Promise<PostgrestSingleResponse<any>> {
    const response = await this.supabase
      .from('user_roles')
      .insert({ user_id: userId, role_id: roleId });
  
    if (response.error) {
      console.error('Error assigning role:', response.error.message);
    }
  
    return response;
  }

  //Used to assign checked user names in the second container in "Roles" tab
  async assignRoleToUsers(roleId: number, userIds: number[]): Promise<void> {
    const { error } = await this.supabase
      .from('user_roles')
      .insert(userIds.map(userId => ({ role_id: roleId, user_id: userId })));

    if (error) {
      throw new Error('Error assigning role to users: ' + error.message);
    }
    await this.refreshSession();
  }

  async unassignUserFromRole(userId: number, roleId: number): Promise<void> {
    const { error } = await this.supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleId);

    if (error) {
      throw new Error('Error unassigning user from role: ' + error.message);
    }
    await this.refreshSession();
  }

  async createRole(roleData: any): Promise<PostgrestSingleResponse<any>> {
    const response = await this.supabase.from('roles').insert([
      {
        role_name: roleData.role_name,
        users_rights: roleData.users_rights,
        roles_rights: roleData.roles_rights,
        sup_rights: roleData.sup_rights,
        par_rights: roleData.par_rights,
        daily_rights: roleData.daily_rights,
        monthly_rights: roleData.monthly_rights,
        weekly_rights: roleData.weekly_rights,
        entries: roleData.entries,
      },
    ]);

    if (response.error) {
      console.error('Error creating role:', response.error.message);
    } else {
      console.log('Role created successfully:', response.data);
    }

    return response;
  }

  //Deletes the selected role in the "Roles" tab, only if no users are assigned to it
  async deleteRole(roleName: string): Promise<void> {
    const { error } = await this.supabase
      .from('roles')
      .delete()
      .eq('role_name', roleName);

    if (error) {
      console.error('Error deleting role:', error.message);
    }
    await this.refreshSession();
  }

  async updateRoleName(role_id: number, role_name: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('roles')
      .update({ role_name })
      .eq('role_id', role_id);
  
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  //Displays the name assigned to the Role clicked in the first container in "Roles" tab
  async getUsersAssignedToRole(roleId: number): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('user_roles')
      .select(`
      user_id,
      profile:profile(first_name, mid_name, surname)
    `)
      .eq('role_id', roleId);
  
    if (error) {
      console.error('Error fetching assigned users:', error.message);
      return [];
    }
  return data.map(user => ({
    user_id: user.user_id,
    ...user.profile
  }));
  }

  async getRoleById(roleId: number): Promise<PostgrestSingleResponse<any>> {
    const response = await this.supabase.from('roles').select('*').eq('role_id', roleId).single();
    if (response.error) {
      console.error('Error fetching role by ID:', response.error.message);
    } else {
      console.log('Role fetched successfully:', response.data);
    }
    return response;
  }

  //for updating access rights
  async fetchRoleAccessRights(roleId: string) {
    const { data, error } = await this.supabase
      .from('roles')
      .select('users_rights, roles_rights, sup_rights, par_rights, daily_rights, weekly_rights, monthly_rights, entries')
      .eq('role_id', roleId)
      .single();

    if (error) throw error;
    return data;
  }

  //for updating access rights
  async updateRoleAccessRight(roleId: string, rightType: string, value: string) {
    const { data, error } = await this.supabase
      .from('roles')
      .update({ [rightType]: value })
      .eq('role_id', roleId);

    if (error) throw error;
    return data;
  }
  async getEmployees(): Promise<PostgrestResponse<any>> {
    const response = await this.supabase.from('profile').select('');
    if (response.error) {
      console.error('Error fetching employees:', response.error.message);
    }
    return response;
  }

  // Delete the user profile
  async deleteUser(email: string): Promise<PostgrestSingleResponse<any>> {
    try {
      // Retrieve the user's profile to get the image path
      const { data: userProfile, error: userProfileError } = await this.supabase
        .from('profile')
        .select('photo_url') // Adjust this to match your actual image path column
        .eq('email', email)
        .single();

      if (userProfileError) {
        console.error('Error retrieving user profile:', userProfileError.message);
        return {
          data: null,
          error: userProfileError,
          count: null,
          status: 500,
          statusText: 'Error retrieving user profile'
        };
      }
  // Delete the photo from storage if it exists
  if (userProfile && userProfile.photo_url) {
    const fileName = userProfile.photo_url.split('/').pop();
    if (fileName) {
      const { error: storageError } = await this.supabase
        .storage
        .from('photos')
        .remove([fileName]);

      if (storageError) {
        console.error('Error deleting image from storage:', storageError.message);
      } else {
        console.log('Image deleted successfully from storage');
      }
    }
  }
      // Delete the user profile
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
        return response;
      }

      console.log('User deleted successfully:', response.data);

      // Refresh the session after the delete operation
      await this.refreshSession();

      // Check if the user profile exists and has an image path
      if (userProfile && userProfile.photo_url) {
        const { error: storageError } = await this.supabase
          .storage
          .from('photos') // Replace with your actual bucket name
          .remove([userProfile.photo_url]);

        if (storageError) {
          console.error('Error deleting image from storage:', storageError.message);
        } else {
          console.log('Image deleted successfully from storage');
        }
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

  async deleteTicket(ticketId: number) {
    return await this.supabase
      .from('ticket')
      .delete()
      .eq('id', ticketId);
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
  
    async updateTicketPriority(ticketId: number, priority: string) {
      const { data, error } = await this.supabase
        .from('ticket')  // Replace with your actual table name
        .update({ priority: priority })
        .eq('id', ticketId);
    
      if (error) {
        console.error('Error updating ticket priority:', error);
        throw error;
      }
    
      return data;
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
  async getAuditLogs() {
    const { data, error } = await this.supabase
      .from('audit')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }

    return data;
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

  //dtr
  async getAttendances(): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('DTR')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        throw error;
      }

      console.log('Fetched data from Supabase:', data);
      return data;
    } catch (error) {
      console.error('Error fetching attendances from Supabase:', error);
      throw error;
    }
  }

  async insertDTRRecord(status: string, name: string) {
    try {
      const { data, error } = await this.supabase
        .from('DTR')
        .insert([
          { 
            status, 
            name, 
            clock_in: new Date(),
            clock_out: null,  // Explicitly set clock_out to null
            schedule_in: '09:00:00',  // 9:00 AM
            schedule_out: '19:00:00' 
          }
        ]);
  
      if (error) throw error;
  
      return data;
    } catch (error) {
      console.error('Error inserting DTR record:', error);
      throw error;
    }
  }
  
  async updateDTRClockOut(name: string) {
    try {
      const { data: existingRecords, error: fetchError } = await this.supabase
        .from('DTR')
        .select('*')
        .eq('name', name)
        .is('clock_out', null);
  
      if (fetchError) throw fetchError;
  
      if (existingRecords.length === 0) {
        throw new Error('No matching Time In record found.');
      }
  
      const { data, error } = await this.supabase
        .from('DTR')
        .update({ clock_out: new Date() })
        .eq('name', name)
        .is('clock_out', null);
  
      if (error) throw error;
  
      return { data, error: null };
    } catch (error) {
      console.error('Error updating DTR record:', error);
      return { data: null, error };
    }
  }

  async getUser() {
    return await this.supabase.auth.getUser();
  }

  async checkTimeInRecord(name: string) {
    try {
      // Find the most recent clock_in record for the user that does not have a clock_out time
      const { data, error } = await this.supabase
        .from('DTR')
        .select('*')
        .eq('name', name)
        .is('clock_out', null)
        .order('clock_in', { ascending: false })
        .limit(1);
  
      if (error) {
        console.error('Error fetching existing Time In records:', error);
        throw error;
      }
  
      return { data, error: null };
    } catch (error) {
      console.error('Error checking Time In record:', error);
      return { data: null, error };
    }
  }

  async hasTimedInToday(name: string): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    try {
      const { data, error } = await this.supabase
        .from('DTR')
        .select('*')
        .eq('name', name)
        .gte('clock_in', today.toISOString())
        .limit(1);
  
      if (error) throw error;
  
      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking if user has timed in today:', error);
      throw error;
    }
  }
  async getTodayAttendances(): Promise<any[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      const { data, error } = await this.supabase
        .from('DTR')
        .select('*')
        .gte('clock_in', today.toISOString())
        .order('clock_in', { ascending: false });
  
      if (error) {
        throw error;
      }
  
      console.log('Fetched today\'s data from Supabase:', data);
      return data;
    } catch (error) {
      console.error('Error fetching today\'s attendances from Supabase:', error);
      throw error;
    }
  }
  
  //reply
  async createReply(reply: any) {
    return await this.supabase
      .from('replies')
      .insert(reply)
      .select();
  }

  async updateTicket(ticket: any) {
    return await this.supabase
      .from('ticket')
      .update({
        reply: ticket.reply,
        status: ticket.status,
        logres: ticket.logres
      })
      .eq('id', ticket.id)
      .select();
  }

}