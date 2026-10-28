import { of } from 'rxjs';
import { vi } from 'vitest';

import {
  AuthApiService,
  CurrentUserResponse,
} from './auth-api.service';
import { Auth } from './auth';
import { TokenStorage } from './token-storage';

describe('Auth', () => {
  let authApiService: {
    getCurrentUser: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    localStorage.clear();

    authApiService = {
      getCurrentUser: vi.fn(),
    };
  });

  function createService(): Auth {
    const tokenStorage = new TokenStorage();

    return new Auth(
      tokenStorage,
      authApiService as unknown as AuthApiService,
    );
  }

  it('should be created', () => {
    const service = createService();

    expect(service).toBeTruthy();
  });

  it('should start unauthenticated when no token exists', () => {
    const service = createService();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.role()).toBeNull();
  });

  it('should start authenticated when a token already exists', () => {
    localStorage.setItem(
      'worksphere_token',
      'existing-jwt-token',
    );

    const service = createService();

    expect(service.isAuthenticated()).toBe(true);
  });

  it('should become authenticated when a token is stored', () => {
    const service = createService();

    service.setToken('test-jwt-token');

    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()).toBeNull();
  });

  it('should load and store the authenticated user', () => {
    const currentUser: CurrentUserResponse = {
      userId: 12,
      organizationId: 3,
      email: 'employee@example.com',
      role: 'EMPLOYEE',
    };

    authApiService.getCurrentUser.mockReturnValue(
      of(currentUser),
    );

    const service = createService();

    service.loadCurrentUser().subscribe((result) => {
      expect(result).toEqual(currentUser);
    });

    expect(service.currentUser()).toEqual(
      currentUser,
    );

    expect(service.role()).toBe('EMPLOYEE');
    expect(service.isEmployee()).toBe(true);
    expect(service.isOrgAdmin()).toBe(false);
  });

  it('should expose organization admin role correctly', () => {
    const currentUser: CurrentUserResponse = {
      userId: 1,
      organizationId: 3,
      email: 'admin@example.com',
      role: 'ORG_ADMIN',
    };

    authApiService.getCurrentUser.mockReturnValue(
      of(currentUser),
    );

    const service = createService();

    service.loadCurrentUser().subscribe();

    expect(service.role()).toBe('ORG_ADMIN');
    expect(service.isOrgAdmin()).toBe(true);
    expect(service.isEmployee()).toBe(false);
  });

  it('should clear the current user and role after logout', () => {
    const currentUser: CurrentUserResponse = {
      userId: 12,
      organizationId: 3,
      email: 'employee@example.com',
      role: 'EMPLOYEE',
    };

    authApiService.getCurrentUser.mockReturnValue(
      of(currentUser),
    );

    const service = createService();

    service.setToken('test-jwt-token');
    service.loadCurrentUser().subscribe();

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.role()).toBeNull();
    expect(service.isEmployee()).toBe(false);
    expect(service.isOrgAdmin()).toBe(false);
  });
});