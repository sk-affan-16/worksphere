import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Observable,
  of,
  throwError,
  firstValueFrom,
} from 'rxjs';
import { vi } from 'vitest';

import { Auth } from './auth';
import { authGuard } from './auth-guard';

describe('authGuard', () => {
  let auth: {
    isAuthenticated: ReturnType<typeof vi.fn>;
    currentUser: ReturnType<typeof vi.fn>;
    loadCurrentUser: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };

  let router: {
    createUrlTree: ReturnType<typeof vi.fn>;
  };

  const routeSnapshot =
    {} as ActivatedRouteSnapshot;

  const routerStateSnapshot =
    {} as RouterStateSnapshot;

  beforeEach(() => {
    auth = {
      isAuthenticated: vi.fn(),
      currentUser: vi.fn(),
      loadCurrentUser: vi.fn(),
      logout: vi.fn(),
    };

    router = {
      createUrlTree: vi.fn().mockReturnValue(
        'LOGIN_URL_TREE',
      ),
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: Auth,
          useValue: auth,
        },
        {
          provide: Router,
          useValue: router,
        },
      ],
    });
  });

  it('should redirect to login when the user is not authenticated', () => {
    auth.isAuthenticated.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(
      () =>
        authGuard(
          routeSnapshot,
          routerStateSnapshot,
        ),
    );

    expect(result).toBe('LOGIN_URL_TREE');
    expect(router.createUrlTree).toHaveBeenCalledWith(
      ['/login'],
    );
    expect(
      auth.loadCurrentUser,
    ).not.toHaveBeenCalled();
  });

  it('should allow navigation when the current user is already loaded', () => {
    auth.isAuthenticated.mockReturnValue(true);

    auth.currentUser.mockReturnValue({
      userId: 12,
      organizationId: 3,
      email: 'employee@example.com',
      role: 'EMPLOYEE',
    });

    const result = TestBed.runInInjectionContext(
      () =>
        authGuard(
          routeSnapshot,
          routerStateSnapshot,
        ),
    );

    expect(result).toBe(true);
    expect(
      auth.loadCurrentUser,
    ).not.toHaveBeenCalled();
  });

  it('should load the current user before allowing navigation', async () => {
    auth.isAuthenticated.mockReturnValue(true);
    auth.currentUser.mockReturnValue(null);

    auth.loadCurrentUser.mockReturnValue(
      of({
        userId: 12,
        organizationId: 3,
        email: 'employee@example.com',
        role: 'EMPLOYEE',
      }),
    );

    const result = TestBed.runInInjectionContext(
      () =>
        authGuard(
          routeSnapshot,
          routerStateSnapshot,
        ),
    );

    const navigationResult =
      await firstValueFrom(
        result as Observable<boolean | UrlTree>,
      );

    expect(navigationResult).toBe(true);
    expect(
      auth.loadCurrentUser,
    ).toHaveBeenCalledTimes(1);
  });

  it('should logout and redirect to login when /me returns 401', async () => {
    auth.isAuthenticated.mockReturnValue(true);
    auth.currentUser.mockReturnValue(null);

    auth.loadCurrentUser.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 401,
          }),
      ),
    );

    const result = TestBed.runInInjectionContext(
      () =>
        authGuard(
          routeSnapshot,
          routerStateSnapshot,
        ),
    );

    const navigationResult =
      await firstValueFrom(
        result as Observable<boolean | UrlTree>,
      );

    expect(auth.logout).toHaveBeenCalledTimes(1);
    expect(navigationResult).toBe(
      'LOGIN_URL_TREE',
    );
  });

  it('should redirect to login when loading the current user fails', async () => {
    auth.isAuthenticated.mockReturnValue(true);
    auth.currentUser.mockReturnValue(null);

    auth.loadCurrentUser.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 500,
          }),
      ),
    );

    const result = TestBed.runInInjectionContext(
      () =>
        authGuard(
          routeSnapshot,
          routerStateSnapshot,
        ),
    );

    const navigationResult =
      await firstValueFrom(
        result as Observable<boolean | UrlTree>,
      );

    expect(auth.logout).not.toHaveBeenCalled();
    expect(navigationResult).toBe(
      'LOGIN_URL_TREE',
    );
  });
});
