import { TestBed } from '@angular/core/testing';
import {
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { of } from 'rxjs';

import { authInterceptor } from './auth-interceptor';
import { TokenStorage } from './token-storage';

describe('authInterceptor', () => {
  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [TokenStorage],
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
});
