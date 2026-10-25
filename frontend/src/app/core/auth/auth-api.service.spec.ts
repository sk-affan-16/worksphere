import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

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
    httpTesting = TestBed.inject(
      HttpTestingController,
    );
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should send login credentials to the backend', () => {
    const requestBody: LoginRequest = {
      email: 'user@example.com',
      password: 'Password123',
    };

    const response: LoginResponse = {
      accessToken: 'test-jwt-token',
      tokenType: 'Bearer',
    };

    service.login(requestBody).subscribe((result) => {
      expect(result).toEqual(response);
    });

    const request = httpTesting.expectOne(
      '/api/auth/login',
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(
      requestBody,
    );

    request.flush(response);
  });

  it('should propagate login errors', () => {
    let receivedStatus: number | undefined;

    service.login({
      email: 'user@example.com',
      password: 'wrong-password',
    }).subscribe({
      next: () => {
        throw new Error(
          'The request should have failed.',
        );
      },
      error: (error: { status: number }) => {
        receivedStatus = error.status;
      },
    });

    const request = httpTesting.expectOne(
      '/api/auth/login',
    );

    request.flush(
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
