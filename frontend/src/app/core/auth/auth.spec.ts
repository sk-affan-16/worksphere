import { Auth } from './auth';
import { TokenStorage } from './token-storage';

describe('Auth', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    const tokenStorage = new TokenStorage();
    const service = new Auth(tokenStorage);

    expect(service).toBeTruthy();
  });

  it('should start unauthenticated when no token exists', () => {
    const tokenStorage = new TokenStorage();
    const service = new Auth(tokenStorage);

    expect(service.isAuthenticated()).toBe(false);
  });

  it('should become authenticated when a token is stored', () => {
    const tokenStorage = new TokenStorage();
    const service = new Auth(tokenStorage);

    service.setToken('test-jwt-token');

    expect(service.isAuthenticated()).toBe(true);
    expect(tokenStorage.getToken()).toBe('test-jwt-token');
  });

  it('should become unauthenticated after logout', () => {
    const tokenStorage = new TokenStorage();
    const service = new Auth(tokenStorage);

    service.setToken('test-jwt-token');
    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(tokenStorage.getToken()).toBeNull();
  });
});
