import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private isLockAcquired = false;

  constructor() {
    const supabaseUrl = 'https://hvqvmxakmursjidtfmdj.supabase.co';
    const supabaseKey = process.env['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2cXZteGFrbXVyc2ppZHRmbWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg2MDA4MjQsImV4cCI6MjAzNDE3NjgyNH0.dykJM61G-58LEnAyCUU6-irano2f4vraV8t1l8C5KZ8'] ?? ''; // Correctly referencing environment variable
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
}
