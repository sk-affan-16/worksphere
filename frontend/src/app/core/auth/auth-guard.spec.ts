
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';

import { Auth } from './auth';
import {
  AuthApiService,
  CurrentUserResponse,
} from './auth-api.service';
import { authGuard } from './auth-guard';

describe('authGuard', () => {
  let auth: {
    isAuthenticated: ReturnType<typeof vi.fn>;
    currentUser: ReturnType<typeof vi.fn>;
    setCurrentUser: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };

  let authApiService: {
    getCurrentUser: ReturnType<typeof vi.fn>;
  };

  let router: {
    createUrlTree: ReturnType<typeof vi.fn>;
  };

  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  const adminUser: CurrentUserResponse = {
    userId: 1,
    organizationId: 1,
    email: 'admin@worksphere.local',
    role: 'ORG_ADMIN',
    firstName: 'WorkSphere',
    lastName: 'Admin',
  };

  const executeGuard = () =>
    TestBed.runInInjectionContext(() =>
      authGuard(route, state),
    );

  beforeEach(() => {
    auth = {
      isAuthenticated: vi.fn().mockReturnValue(false),
      currentUser: vi.fn().mockReturnValue(null),
      setCurrentUser: vi.fn(),
      logout: vi.fn(),
    };

    authApiService = {
      getCurrentUser: vi.fn().mockReturnValue(of(adminUser)),
    };

    router = {
      createUrlTree: vi.fn().mockReturnValue({} as UrlTree),
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: Auth,
          useValue: auth,
        },
        {
          provide: AuthApiService,
          useValue: authApiService,
        },
        {
          provide: Router,
          useValue: router,
        },
      ],
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow an authenticated user whose profile is already loaded', () => {
    auth.isAuthenticated.mockReturnValue(true);
    auth.currentUser.mockReturnValue(adminUser);

    const result = executeGuard();

    expect(result).toBe(true);
    expect(authApiService.getCurrentUser).not.toHaveBeenCalled();
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('should load the current user before allowing access', async () => {
    auth.isAuthenticated.mockReturnValue(true);
    authApiService.getCurrentUser.mockReturnValue(of(adminUser));

    const result = executeGuard();

    expect(result).not.toBe(true);

    const guardResult = await firstValueFrom(
      result as Observable<boolean | UrlTree>,
    );

    expect(guardResult).toBe(true);
    expect(authApiService.getCurrentUser).toHaveBeenCalledTimes(1);
    expect(auth.setCurrentUser).toHaveBeenCalledWith(adminUser);
  });

  it('should redirect an unauthenticated user to login', () => {
    const loginUrlTree = {} as UrlTree;

    auth.isAuthenticated.mockReturnValue(false);
    router.createUrlTree.mockReturnValue(loginUrlTree);

    const result = executeGuard();

    expect(result).toBe(loginUrlTree);
    expect(authApiService.getCurrentUser).not.toHaveBeenCalled();
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('should clear an invalid session and redirect to login', async () => {
    const loginUrlTree = {} as UrlTree;

    auth.isAuthenticated.mockReturnValue(true);

    authApiService.getCurrentUser.mockReturnValue(
      throwError(() => new Error('Invalid or expired token')),
    );

    router.createUrlTree.mockReturnValue(loginUrlTree);

    const result = executeGuard();

    const guardResult = await firstValueFrom(
      result as Observable<boolean | UrlTree>,
    );

    expect(guardResult).toBe(loginUrlTree);
    expect(auth.logout).toHaveBeenCalledTimes(1);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
