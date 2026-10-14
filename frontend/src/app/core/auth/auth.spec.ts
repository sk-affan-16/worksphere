import { Auth } from './auth';
import { TokenStorage } from './token-storage';

describe('Auth', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
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

  it('should start authenticated when a token already exists in local storage', () => {
    localStorage.setItem(
      'worksphere_token',
      'existing-jwt-token',
    );

    const tokenStorage = new TokenStorage();
    const service = new Auth(tokenStorage);

    expect(service.isAuthenticated()).toBe(true);
  });

  it('should start authenticated when a token already exists in session storage', () => {
    sessionStorage.setItem(
      'worksphere_token',
      'existing-jwt-token',
    );

    const tokenStorage = new TokenStorage();
    const service = new Auth(tokenStorage);

    expect(service.isAuthenticated()).toBe(true);
  });

  it('should become authenticated and store the token in session storage by default', () => {
    const tokenStorage = new TokenStorage();
    const service = new Auth(tokenStorage);

    service.setToken('test-jwt-token');

    expect(service.isAuthenticated()).toBe(true);
    expect(tokenStorage.getToken()).toBe('test-jwt-token');
    expect(
      sessionStorage.getItem('worksphere_token'),
    ).toBe('test-jwt-token');
    expect(
      localStorage.getItem('worksphere_token'),
    ).toBeNull();
  });

  it('should become authenticated and store the token in local storage when remember me is enabled', () => {
    const tokenStorage = new TokenStorage();
    const service = new Auth(tokenStorage);

    service.setToken('test-jwt-token', true);

    expect(service.isAuthenticated()).toBe(true);
    expect(tokenStorage.getToken()).toBe('test-jwt-token');
    expect(
      localStorage.getItem('worksphere_token'),
    ).toBe('test-jwt-token');
    expect(
      sessionStorage.getItem('worksphere_token'),
    ).toBeNull();
  });

  it('should replace an existing stored token when setToken is called', () => {
    localStorage.setItem(
      'worksphere_token',
      'old-local-token',
    );

    sessionStorage.setItem(
      'worksphere_token',
      'old-session-token',
    );

    const tokenStorage = new TokenStorage();
    const service = new Auth(tokenStorage);

    service.setToken('new-jwt-token');

    expect(
      localStorage.getItem('worksphere_token'),
    ).toBeNull();

    expect(
      sessionStorage.getItem('worksphere_token'),
    ).toBe('new-jwt-token');

    expect(tokenStorage.getToken()).toBe('new-jwt-token');
  });

  it('should become unauthenticated after logout', () => {
    const tokenStorage = new TokenStorage();
    const service = new Auth(tokenStorage);

    service.setToken('test-jwt-token');
    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(tokenStorage.getToken()).toBeNull();

    expect(
      localStorage.getItem('worksphere_token'),
    ).toBeNull();

    expect(
      sessionStorage.getItem('worksphere_token'),
    ).toBeNull();
  });

  it('should clear both storage locations when logging out', () => {
    localStorage.setItem(
      'worksphere_token',
      'local-token',
    );

    sessionStorage.setItem(
      'worksphere_token',
      'session-token',
    );

    const tokenStorage = new TokenStorage();
    const service = new Auth(tokenStorage);

    service.logout();

    expect(
      localStorage.getItem('worksphere_token'),
    ).toBeNull();

    expect(
      sessionStorage.getItem('worksphere_token'),
    ).toBeNull();

    expect(service.isAuthenticated()).toBe(false);
  });
});
