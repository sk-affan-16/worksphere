
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { Auth } from './auth';
import { AuthApiService } from './auth-api.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const authApi = inject(AuthApiService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  // The role is already loaded. Continue without another API request.
  if (auth.currentUser()) {
    return true;
  }

  // Load the authenticated user's profile before activating the app shell.
  return authApi.getCurrentUser().pipe(
    map((user) => {
      auth.setCurrentUser(user);
      return true;
    }),
    catchError(() => {
      // An invalid or expired session must not enter the protected area.
      auth.logout();
      return of(router.createUrlTree(['/login']));
    }),
  );
};
