import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
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
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error('Authentication error:', error.message);
    } else {
      console.log('User authenticated:', data);
    }
    return { data, error };
  }
}
