import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { Auth } from '../../../core/auth/auth';
import { AuthApiService } from '../../../core/auth/auth-api.service';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  let authApiService: {
    login: ReturnType<typeof vi.fn>;
  };

  let auth: {
    setToken: ReturnType<typeof vi.fn>;
  };

  let router: {
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authApiService = {
      login: vi.fn(),
    };

    auth = {
      setToken: vi.fn(),
    };

    router = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        {
          provide: AuthApiService,
          useValue: authApiService,
        },
        {
          provide: Auth,
          useValue: auth,
        },
        {
          provide: Router,
          useValue: router,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should mark the form as touched when submitted while invalid', () => {
    component['loginForm'].setValue({
      email: '',
      password: '',
      rememberMe: false,
    });

    component['submit']();

    expect(
      component['loginForm'].controls.email.touched,
    ).toBe(true);

    expect(
      component['loginForm'].controls.password.touched,
    ).toBe(true);

    expect(authApiService.login).not.toHaveBeenCalled();
  });

  it('should reject an invalid email address', () => {
    component['loginForm'].controls.email.setValue('abc');

    expect(
      component['loginForm'].controls.email.invalid,
    ).toBe(true);
  });

  it('should accept a valid email address', () => {
    component['loginForm'].controls.email.setValue(
      'test@example.com',
    );

    expect(
      component['loginForm'].controls.email.valid,
    ).toBe(true);
  });

  it('should login successfully and navigate to dashboard', () => {
    component['loginForm'].setValue({
      email: 'test2366@email.com',
      password: 'Password123',
      rememberMe: false,
    });

    authApiService.login.mockReturnValue(
      of({
        accessToken: 'test-jwt-token',
        tokenType: 'Bearer',
      }),
    );

    component['submit']();

    expect(authApiService.login).toHaveBeenCalledWith({
      email: 'test2366@email.com',
      password: 'Password123',
    });

    expect(auth.setToken).toHaveBeenCalledWith(
      'test-jwt-token',
    );

    expect(router.navigate).toHaveBeenCalledWith([
      '/dashboard',
    ]);

    expect(component.isSubmitting()).toBe(false);
  });

  it('should show invalid credentials for a 401 response', () => {
    component['loginForm'].setValue({
      email: 'test2366@email.com',
      password: 'wrong-password',
      rememberMe: false,
    });

    authApiService.login.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 401,
            statusText: 'Unauthorized',
            error: {
              code: 'INVALID_CREDENTIALS',
              message: 'Invalid email or password',
            },
          }),
      ),
    );

    component['submit']();

    expect(component.loginError()).toBe(
      'Invalid email or password.',
    );

    expect(component.isSubmitting()).toBe(false);

    expect(auth.setToken).not.toHaveBeenCalled();

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should show the backend error message for other HTTP errors', () => {
    component['loginForm'].setValue({
      email: 'test2366@email.com',
      password: 'Password123',
      rememberMe: false,
    });

    authApiService.login.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            statusText: 'Bad Request',
            error: {
              code: 'BAD_REQUEST',
              message: 'Invalid request',
            },
          }),
      ),
    );

    component['submit']();

    expect(component.loginError()).toBe(
      'Invalid request',
    );
  });

  it('should show a generic error when no backend message exists', () => {
    component['loginForm'].setValue({
      email: 'test2366@email.com',
      password: 'Password123',
      rememberMe: false,
    });

    authApiService.login.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 500,
            statusText: 'Server Error',
          }),
      ),
    );

    component['submit']();

    expect(component.loginError()).toBe(
      'Unable to sign in. Please try again.',
    );
  });

  it('should toggle password visibility', () => {
    expect(component['showPassword']).toBe(false);

    component['togglePassword']();

    expect(component['showPassword']).toBe(true);

    component['togglePassword']();

    expect(component['showPassword']).toBe(false);
  });

  it('should update password input type and toggle label', () => {
    const compiled =
      fixture.nativeElement as HTMLElement;

    let passwordInput = compiled.querySelector(
      '#password',
    ) as HTMLInputElement;

    let toggleButton = compiled.querySelector(
      '.password-toggle',
    ) as HTMLButtonElement;

    expect(passwordInput.type).toBe('password');

    expect(
      toggleButton.getAttribute('aria-label'),
    ).toBe('Show password');

    toggleButton.click();
    fixture.detectChanges();

    passwordInput = compiled.querySelector(
      '#password',
    ) as HTMLInputElement;

    toggleButton = compiled.querySelector(
      '.password-toggle',
    ) as HTMLButtonElement;

    expect(passwordInput.type).toBe('text');

    expect(
      toggleButton.getAttribute('aria-label'),
    ).toBe('Hide password');
  });

  it('should show the loading state while submitting', () => {
    component.isSubmitting.set(true);
    fixture.detectChanges();

    const compiled =
      fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector('.login-loading'),
    ).toBeTruthy();

    expect(
      compiled.querySelector('.login-button')?.textContent,
    ).toContain('Signing in...');
  });

  it('should disable the login button while submitting', () => {
    component.isSubmitting.set(true);
    fixture.detectChanges();

    const button =
      fixture.nativeElement.querySelector(
        '.login-button',
      ) as HTMLButtonElement;

    expect(button.disabled).toBe(true);
  });

  it('should display the login error', () => {
    component.loginError.set(
      'Invalid email or password.',
    );
    fixture.detectChanges();

    const compiled =
      fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector('.login-status'),
    ).toBeTruthy();

    expect(
      compiled.textContent,
    ).toContain(
      'Invalid email or password.',
    );
  });

  it('should expose login errors as an accessible alert', () => {
    component.loginError.set(
      'Invalid email or password.',
    );
    fixture.detectChanges();

    const compiled =
      fixture.nativeElement as HTMLElement;

    const status =
      compiled.querySelector('.login-status');

    expect(
      status?.getAttribute('role'),
    ).toBe('alert');

    expect(
      status?.getAttribute('aria-live'),
    ).toBe('assertive');
  });
});
