import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

export const authGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const supabaseService = inject(SupabaseService);
  const session = await supabaseService.getSession();

  if (session) {
    return true;
  }

  return router.createUrlTree(['/auth']);
};

export const guestGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const supabaseService = inject(SupabaseService);
  const session = await supabaseService.getSession();

  if (!session) {
    return true;
  }

  return router.createUrlTree(['/tabs/tab1']);
};
