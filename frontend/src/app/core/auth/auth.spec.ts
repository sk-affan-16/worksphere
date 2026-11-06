import { of, throwError } from 'rxjs';

import { Auth } from './auth';
import { AuthApiService } from './auth-api.service';
import { TokenStorage } from './token-storage';

describe('Auth', () => {
  let tokenStorage: TokenStorage;
  let authApiService: {
    getCurrentUser: ReturnType<typeof vi.fn>;
  };

  let service: Auth;

  const adminUser = {
    userId: 1,
    organizationId: 1,
    email: 'admin@example.com',
    role: 'ORG_ADMIN' as const,
  };

  beforeEach(() => {
    localStorage.clear();

    tokenStorage = new TokenStorage();

    authApiService = {
      getCurrentUser: vi.fn(),
    };

    service = new Auth(
      tokenStorage,
      authApiService as unknown as AuthApiService,
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start unauthenticated when no token exists', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should start authenticated when a token already exists', () => {
    tokenStorage.saveToken('existing-jwt-token');

    service = new Auth(
      tokenStorage,
      authApiService as unknown as AuthApiService,
    );

    expect(service.isAuthenticated()).toBe(true);
  });

  it('should become authenticated when a token is stored', () => {
    service.setToken('test-jwt-token');

    expect(service.isAuthenticated()).toBe(true);
    expect(tokenStorage.getToken()).toBe('test-jwt-token');
  });

  it('should become unauthenticated after logout', () => {
    service.setToken('test-jwt-token');
    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(tokenStorage.getToken()).toBeNull();
    expect(service.currentUser()).toBeNull();
  });

  it('should load the authenticated user from the backend', () => {
    authApiService.getCurrentUser.mockReturnValue(of(adminUser));

    service.setToken('test-jwt-token');

    service.loadCurrentUser().subscribe((user) => {
      expect(user).toEqual(adminUser);
      expect(service.currentUser()).toEqual(adminUser);
      expect(service.hasRole('ORG_ADMIN')).toBe(true);
      expect(service.hasRole('EMPLOYEE')).toBe(false);
    });
  });

  it('should clear authentication when loading the current user fails', () => {
    authApiService.getCurrentUser.mockReturnValue(
      throwError(() => new Error('Unauthorized')),
    );

    service.setToken('test-jwt-token');

    service.loadCurrentUser().subscribe({
      error: () => {
        expect(service.isAuthenticated()).toBe(false);
        expect(tokenStorage.getToken()).toBeNull();
      },
    });
  });
});
