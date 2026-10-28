import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { Auth } from './auth';
import { UserRole } from './auth-api.service';

export const roleGuard = (
  allowedRoles: UserRole[],
): CanActivateFn => {
  return (
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ) => {
    const auth = inject(Auth);
    const router = inject(Router);

    const role = auth.role();

    if (
      role !== null &&
      allowedRoles.includes(role)
    ) {
      return true;
    }

    return router.createUrlTree(['/dashboard']);
  };
};