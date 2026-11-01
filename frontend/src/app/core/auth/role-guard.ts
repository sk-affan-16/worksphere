import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { Auth } from './auth';
import { AuthApiService, UserRole } from './auth-api.service';

export const roleGuard = (
  allowedRoles: UserRole[],
): CanActivateFn => {
  return () => {
    const auth = inject(Auth);
    const authApi = inject(AuthApiService);
    const router = inject(Router);

    // Redirect unauthenticated users to login.
    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }

    // Verify the logged-in user with the backend.
    return authApi.getCurrentUser().pipe(
      map((user) => {
        auth.setCurrentUser(user);

        // Allow access only to the specified role.
        if (allowedRoles.includes(user.role)) {
          return true;
        }

        // Authenticated, but not authorized for this route.
        return router.createUrlTree(['/dashboard']);
      }),

      catchError(() => {
        // If the token is invalid or the API request fails,
        // clear authentication and return to login.
        auth.logout();

        return of(router.createUrlTree(['/login']));
      }),
    );
  };
};
