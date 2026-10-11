import { TestBed } from '@angular/core/testing';

import { TokenStorage } from './token-storage';

describe('TokenStorage', () => {
  let service: TokenStorage;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenStorage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save a token to local storage', () => {
    service.saveToken('test-jwt-token');

    expect(
      localStorage.getItem('worksphere_token'),
    ).toBe('test-jwt-token');
  });

  it('should return the stored token', () => {
    localStorage.setItem(
      'worksphere_token',
      'test-jwt-token',
    );

    expect(service.getToken()).toBe('test-jwt-token');
  });

  it('should report true when a token exists', () => {
    localStorage.setItem(
      'worksphere_token',
      'test-jwt-token',
    );

    expect(service.hasToken()).toBe(true);
  });

  it('should report false when no token exists', () => {
    expect(service.hasToken()).toBe(false);
  });

  it('should clear the stored token', () => {
    localStorage.setItem(
      'worksphere_token',
      'test-jwt-token',
    );

    service.clearToken();

    expect(service.getToken()).toBeNull();
    expect(service.hasToken()).toBe(false);
  });
});
