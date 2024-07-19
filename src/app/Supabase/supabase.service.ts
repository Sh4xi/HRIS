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

  async logAction(userId: number, action: string) {
    const { error } = await this.supabase
      .from('audit')
      .insert([{ user_id: userId, action }]);

    if (error) {
      console.error('Error logging action:', error);
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
          { status, 
            name, 
            clock_in: new Date(),
            schedule_in: '09:00:00',  // 9:00 AM
            schedule_out: '19:00:00', }
        ]);

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error inserting DTR record:', error);
      throw error;
    }
  }

  async getUser() {
    return await this.supabase.auth.getUser();
  }

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
