import { TestBed } from '@angular/core/testing';

import { TokenStorage } from './token-storage';

describe('TokenStorage', () => {
  let service: TokenStorage;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();

    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenStorage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save a token to session storage by default', () => {
    service.saveToken('test-jwt-token');

    expect(
      sessionStorage.getItem('worksphere_token'),
    ).toBe('test-jwt-token');

    expect(
      localStorage.getItem('worksphere_token'),
    ).toBeNull();
  });

  it('should save a token to local storage when remember me is enabled', () => {
    service.saveToken('test-jwt-token', true);

    expect(
      localStorage.getItem('worksphere_token'),
    ).toBe('test-jwt-token');

    expect(
      sessionStorage.getItem('worksphere_token'),
    ).toBeNull();
  });

  it('should return a token from local storage', () => {
    localStorage.setItem(
      'worksphere_token',
      'test-jwt-token',
    );

    expect(service.getToken()).toBe('test-jwt-token');
  });

  it('should return a token from session storage', () => {
    sessionStorage.setItem(
      'worksphere_token',
      'test-jwt-token',
    );

    expect(service.getToken()).toBe('test-jwt-token');
  });

  it('should report true when a token exists', () => {
    sessionStorage.setItem(
      'worksphere_token',
      'test-jwt-token',
    );

    expect(service.hasToken()).toBe(true);
  });

  it('should report false when no token exists', () => {
    expect(service.hasToken()).toBe(false);
  });

  it('should clear the token from both storage locations', () => {
    localStorage.setItem(
      'worksphere_token',
      'local-token',
    );

    sessionStorage.setItem(
      'worksphere_token',
      'session-token',
    );

    service.clearToken();

    expect(localStorage.getItem('worksphere_token')).toBeNull();
    expect(sessionStorage.getItem('worksphere_token')).toBeNull();
    expect(service.getToken()).toBeNull();
    expect(service.hasToken()).toBe(false);
  });
});
