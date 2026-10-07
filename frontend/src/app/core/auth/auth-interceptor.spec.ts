import { TestBed } from '@angular/core/testing';
import {
  HttpErrorResponse,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Auth } from './auth';
import { authInterceptor } from './auth-interceptor';
import { TokenStorage } from './token-storage';

describe('authInterceptor', () => {
  let auth: {
    logout: ReturnType<typeof vi.fn>;
  };

  let router: {
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    localStorage.clear();

    auth = {
      logout: vi.fn(),
    };

    router = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    TestBed.configureTestingModule({
      providers: [
        TokenStorage,
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

  it('should pass the request unchanged when no token exists', () => {
    const request = new HttpRequest('GET', '/api/test');

    let forwardedRequest: HttpRequest<unknown> | undefined;

    const next = (req: HttpRequest<unknown>) => {
      forwardedRequest = req;

      return of(
        new HttpResponse({
          status: 200,
        }),
      );
    };

    TestBed.runInInjectionContext(() => {
      authInterceptor(request, next);
    });

    if (!forwardedRequest) {
      throw new Error('The interceptor did not forward the request.');
    }

    expect(forwardedRequest).toBe(request);
  });

  it('should add the bearer token when a token exists', () => {
    localStorage.setItem(
      'worksphere_token',
      'test-jwt-token',
    );

    const request = new HttpRequest('GET', '/api/test');

    let forwardedRequest: HttpRequest<unknown> | undefined;

    const next = (req: HttpRequest<unknown>) => {
      forwardedRequest = req;

      return of(
        new HttpResponse({
          status: 200,
        }),
      );
    };

    TestBed.runInInjectionContext(() => {
      authInterceptor(request, next);
    });

    if (!forwardedRequest) {
      throw new Error('The interceptor did not forward the request.');
    }

    expect(
      forwardedRequest.headers.get('Authorization'),
    ).toBe('Bearer test-jwt-token');
  });

  it('should logout and navigate to login on a 401 response', () => {
    localStorage.setItem(
      'worksphere_token',
      'test-jwt-token',
    );

    const request = new HttpRequest('GET', '/api/test');

    const error = new HttpErrorResponse({
      status: 401,
      statusText: 'Unauthorized',
      url: '/api/test',
    });

    const next = () => throwError(() => error);

    TestBed.runInInjectionContext(() => {
      authInterceptor(request, next).subscribe({
        error: () => undefined,
      });
    });

    expect(auth.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should not logout on a non-401 error', () => {
    localStorage.setItem(
      'worksphere_token',
      'test-jwt-token',
    );

    const request = new HttpRequest('GET', '/api/test');

    const error = new HttpErrorResponse({
      status: 500,
      statusText: 'Server Error',
      url: '/api/test',
    });

    const next = () => throwError(() => error);

    TestBed.runInInjectionContext(() => {
      authInterceptor(request, next).subscribe({
        error: () => undefined,
      });
    });

    expect(auth.logout).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
