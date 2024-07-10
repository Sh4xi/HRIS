import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../Supabase/supabase.service'; // Adjust the path if necessary

export const authGuard = () => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  if (supabaseService.isAuthenticated()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};