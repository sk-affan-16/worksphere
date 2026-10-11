import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { Auth } from './auth';
import { authGuard } from './auth-guard';

describe('authGuard', () => {
  let auth: {
    isAuthenticated: ReturnType<typeof vi.fn>;
  };

  let router: {
    createUrlTree: ReturnType<typeof vi.fn>;
  };

  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  const executeGuard = () =>
    TestBed.runInInjectionContext(() =>
      authGuard(route, state),
    );

  beforeEach(() => {
    auth = {
      isAuthenticated: vi.fn(),
    };

    router = {
      createUrlTree: vi.fn(),
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

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow an authenticated user', () => {
    auth.isAuthenticated.mockReturnValue(true);

    const result = executeGuard();

    expect(result).toBe(true);
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect an unauthenticated user to login', () => {
    const loginUrlTree = {} as UrlTree;

    auth.isAuthenticated.mockReturnValue(false);
    router.createUrlTree.mockReturnValue(loginUrlTree);

    const result = executeGuard();

    expect(result).toBe(loginUrlTree);
    expect(router.createUrlTree).toHaveBeenCalledWith([
      '/login',
    ]);
  });
});
