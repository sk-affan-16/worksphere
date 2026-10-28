import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import {
  AuthApiService,
  CurrentUserResponse,
} from './auth-api.service';
import { Auth } from './auth';
import { roleGuard } from './role-guard';
import { TokenStorage } from './token-storage';

describe('role-based flow', () => {
  let authApiService: {
    getCurrentUser: ReturnType<typeof vi.fn>;
  };

  let router: {
    createUrlTree: ReturnType<typeof vi.fn>;
  };

  const routeSnapshot =
    {} as ActivatedRouteSnapshot;

  const routerStateSnapshot =
    {} as RouterStateSnapshot;

  const adminUser: CurrentUserResponse = {
    userId: 1,
    organizationId: 3,
    email: 'admin@example.com',
    role: 'ORG_ADMIN',
  };

  const employeeUser: CurrentUserResponse = {
    userId: 12,
    organizationId: 3,
    email: 'employee@example.com',
    role: 'EMPLOYEE',
  };

  beforeEach(() => {
    localStorage.clear();

    authApiService = {
      getCurrentUser: vi.fn(),
    };

    router = {
      createUrlTree: vi.fn().mockReturnValue(
        'DASHBOARD_URL_TREE' as unknown as UrlTree,
      ),
    };

    TestBed.configureTestingModule({
      providers: [
        TokenStorage,
        {
          provide: AuthApiService,
          useValue: authApiService,
        },
        {
          provide: Router,
          useValue: router,
        },
        Auth,
      ],
    });
  });

  it('should complete the ORG_ADMIN authentication flow', () => {
    authApiService.getCurrentUser.mockReturnValue(
      of(adminUser),
    );

    const auth = TestBed.inject(Auth);

    auth.setToken('admin-jwt-token');

    expect(auth.isAuthenticated()).toBe(true);

    auth.loadCurrentUser().subscribe();

    expect(auth.currentUser()).toEqual(
      adminUser,
    );

    expect(auth.role()).toBe('ORG_ADMIN');
    expect(auth.isOrgAdmin()).toBe(true);
    expect(auth.isEmployee()).toBe(false);
  });

  it('should allow ORG_ADMIN access to an admin route', () => {
    authApiService.getCurrentUser.mockReturnValue(
      of(adminUser),
    );

    const auth = TestBed.inject(Auth);

    auth.setToken('admin-jwt-token');
    auth.loadCurrentUser().subscribe();

    const guard = roleGuard(['ORG_ADMIN']);

    const result = TestBed.runInInjectionContext(
      () =>
        guard(
          routeSnapshot,
          routerStateSnapshot,
        ),
    );

    expect(result).toBe(true);
    expect(
      router.createUrlTree,
    ).not.toHaveBeenCalled();
  });

  it('should complete the EMPLOYEE authentication flow', () => {
    authApiService.getCurrentUser.mockReturnValue(
      of(employeeUser),
    );

    const auth = TestBed.inject(Auth);

    auth.setToken('employee-jwt-token');

    expect(auth.isAuthenticated()).toBe(true);

    auth.loadCurrentUser().subscribe();

    expect(auth.currentUser()).toEqual(
      employeeUser,
    );

    expect(auth.role()).toBe('EMPLOYEE');
    expect(auth.isEmployee()).toBe(true);
    expect(auth.isOrgAdmin()).toBe(false);
  });

  it('should reject EMPLOYEE access to an admin route', () => {
    authApiService.getCurrentUser.mockReturnValue(
      of(employeeUser),
    );

    const auth = TestBed.inject(Auth);

    auth.setToken('employee-jwt-token');
    auth.loadCurrentUser().subscribe();

    const guard = roleGuard(['ORG_ADMIN']);

    const result = TestBed.runInInjectionContext(
      () =>
        guard(
          routeSnapshot,
          routerStateSnapshot,
        ),
    );

    expect(result).toBe(
      'DASHBOARD_URL_TREE',
    );

    expect(
      router.createUrlTree,
    ).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should allow EMPLOYEE access to an employee route', () => {
    authApiService.getCurrentUser.mockReturnValue(
      of(employeeUser),
    );

    const auth = TestBed.inject(Auth);

    auth.setToken('employee-jwt-token');
    auth.loadCurrentUser().subscribe();

    const guard = roleGuard(['EMPLOYEE']);

    const result = TestBed.runInInjectionContext(
      () =>
        guard(
          routeSnapshot,
          routerStateSnapshot,
        ),
    );

    expect(result).toBe(true);
    expect(
      router.createUrlTree,
    ).not.toHaveBeenCalled();
  });

  it('should keep the role state after the current user is loaded', () => {
    authApiService.getCurrentUser.mockReturnValue(
      of(employeeUser),
    );

    const auth = TestBed.inject(Auth);

    auth.setToken('employee-jwt-token');
    auth.loadCurrentUser().subscribe();

    expect(auth.currentUser()?.userId).toBe(12);
    expect(
      auth.currentUser()?.organizationId,
    ).toBe(3);
    expect(
      auth.currentUser()?.email,
    ).toBe('employee@example.com');
    expect(
      auth.currentUser()?.role,
    ).toBe('EMPLOYEE');
  });
});
