import { inject } from '@angular/core';
import {
  HttpErrorResponse,
} from '@angular/common/http';
import {
  CanActivateFn,
  Router,
} from '@angular/router';
import {
  catchError,
  map,
  of,
} from 'rxjs';

import { Auth } from './auth';

export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  if (auth.currentUser()) {
    return true;
  }

  return auth.loadCurrentUser().pipe(
    map(() => true),
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401
      ) {
        auth.logout();
      }

      return of(
        router.createUrlTree(['/login']),
      );
    }),
  );
};