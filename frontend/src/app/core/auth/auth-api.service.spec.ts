import { TestBed } from '@angular/core/testing';
import {
  provideHttpClient,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import {
  AuthApiService,
  LoginRequest,
  LoginResponse,
} from './auth-api.service';

describe('AuthApiService', () => {
  let service: AuthApiService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AuthApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    TestBed.resetTestingModule();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should send login credentials to the auth login endpoint', () => {
    const request: LoginRequest = {
      email: 'user@example.com',
      password: 'password123',
    };

    const response: LoginResponse = {
      accessToken: 'test-jwt-token',
      tokenType: 'Bearer',
    };

    let receivedResponse: LoginResponse | undefined;

    service.login(request).subscribe((result) => {
      receivedResponse = result;
    });

    const httpRequest = httpTesting.expectOne(
      '/api/auth/login',
    );

    expect(httpRequest.request.method).toBe('POST');

    expect(httpRequest.request.body).toEqual(request);

    httpRequest.flush(response);

    expect(receivedResponse).toEqual(response);
  });

  it('should return the access token from the login response', () => {
    const request: LoginRequest = {
      email: 'user@example.com',
      password: 'password123',
    };

    const response: LoginResponse = {
      accessToken: 'abc123',
      tokenType: 'Bearer',
    };

    let receivedToken = '';

    service.login(request).subscribe((result) => {
      receivedToken = result.accessToken;
    });

    const httpRequest = httpTesting.expectOne(
      '/api/auth/login',
    );

    httpRequest.flush(response);

    expect(receivedToken).toBe('abc123');
  });

  it('should propagate a 401 authentication error', () => {
    const request: LoginRequest = {
      email: 'wrong@example.com',
      password: 'wrong-password',
    };

    let receivedStatus: number | undefined;

    service.login(request).subscribe({
      next: () => {
        throw new Error(
          'The login request should have failed.',
        );
      },
      error: (error: { status: number }) => {
        receivedStatus = error.status;
      },
    });

    const httpRequest = httpTesting.expectOne(
      '/api/auth/login',
    );

    httpRequest.flush(
      {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      },
      {
        status: 401,
        statusText: 'Unauthorized',
      },
    );

    expect(receivedStatus).toBe(401);
  });
});
