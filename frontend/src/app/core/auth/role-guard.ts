import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
} from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { Auth } from './auth';
import { UserRole } from './auth-api.service';

export const roleGuard = (
  allowedRoles: UserRole[],
): CanActivateFn => {
  return () => {
    const auth = inject(Auth);
    const router = inject(Router);

    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }

    return auth.loadCurrentUser().pipe(
      map((user) => {
        if (allowedRoles.includes(user.role)) {
          return true;
        }

        return router.createUrlTree(['/dashboard']);
      }),
      catchError(() =>
        of(router.createUrlTree(['/login'])),
      ),
    );
  };
};
