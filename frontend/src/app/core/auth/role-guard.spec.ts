import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { vi } from 'vitest';

import { Auth } from './auth';
import { roleGuard } from './role-guard';

describe('roleGuard', () => {
  let auth: {
    role: ReturnType<typeof vi.fn>;
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
      role: vi.fn(),
    };

    router = {
      createUrlTree: vi.fn().mockReturnValue(
        'DASHBOARD_URL_TREE',
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

  it('should allow an organization admin for ORG_ADMIN routes', () => {
    auth.role.mockReturnValue('ORG_ADMIN');

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

  it('should allow an employee for EMPLOYEE routes', () => {
    auth.role.mockReturnValue('EMPLOYEE');

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

  it('should reject an employee from an organization admin route', () => {
    auth.role.mockReturnValue('EMPLOYEE');

    const guard = roleGuard(['ORG_ADMIN']);

    const result = TestBed.runInInjectionContext(
      () =>
        guard(
          routeSnapshot,
          routerStateSnapshot,
        ),
    );

    expect(result).toBe('DASHBOARD_URL_TREE');
    expect(
      router.createUrlTree,
    ).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should reject an organization admin from an employee-only route', () => {
    auth.role.mockReturnValue('ORG_ADMIN');

    const guard = roleGuard(['EMPLOYEE']);

    const result = TestBed.runInInjectionContext(
      () =>
        guard(
          routeSnapshot,
          routerStateSnapshot,
        ),
    );

    expect(result).toBe('DASHBOARD_URL_TREE');
    expect(
      router.createUrlTree,
    ).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should reject navigation when no role is loaded', () => {
    auth.role.mockReturnValue(null);

    const guard = roleGuard(['ORG_ADMIN']);

    const result = TestBed.runInInjectionContext(
      () =>
        guard(
          routeSnapshot,
          routerStateSnapshot,
        ),
    );

    expect(result).toBe('DASHBOARD_URL_TREE');
    expect(
      router.createUrlTree,
    ).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should allow multiple configured roles', () => {
    auth.role.mockReturnValue('EMPLOYEE');

    const guard = roleGuard([
      'ORG_ADMIN',
      'EMPLOYEE',
    ]);

    const result = TestBed.runInInjectionContext(
      () =>
        guard(
          routeSnapshot,
          routerStateSnapshot,
        ),
    );

    expect(result).toBe(true);
  });
});