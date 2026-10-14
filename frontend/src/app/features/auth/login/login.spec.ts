import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { Login } from './login';
import { AuthApiService } from '../../../core/auth/auth-api.service';
import { Auth } from '../../../core/auth/auth';

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
      navigate: vi.fn().mockResolvedValue(true),
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

  afterEach(() => {
    TestBed.resetTestingModule();
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

  it('should update the remember me form value when checked', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const rememberMeCheckbox = compiled.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;

    expect(rememberMeCheckbox.checked).toBe(false);
    expect(
      component['loginForm'].controls.rememberMe.value,
    ).toBe(false);

    rememberMeCheckbox.click();
    fixture.detectChanges();

    expect(rememberMeCheckbox.checked).toBe(true);
    expect(
      component['loginForm'].controls.rememberMe.value,
    ).toBe(true);
  });

  it('should connect validation messages to their inputs for accessibility', () => {
    component['submit']();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    const emailInput = compiled.querySelector(
      '#email',
    ) as HTMLInputElement;

    const passwordInput = compiled.querySelector(
      '#password',
    ) as HTMLInputElement;

    expect(emailInput.getAttribute('aria-invalid')).toBe('true');
    expect(emailInput.getAttribute('aria-describedby')).toBe(
      'email-error',
    );

    expect(passwordInput.getAttribute('aria-invalid')).toBe('true');
    expect(passwordInput.getAttribute('aria-describedby')).toBe(
      'password-error',
    );

    expect(
      compiled.querySelector('#email-error'),
    ).toBeTruthy();

    expect(
      compiled.querySelector('#password-error'),
    ).toBeTruthy();
  });

  it('should display required validation messages', () => {
    component['submit']();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(
      'Email address is required.',
    );

    expect(compiled.textContent).toContain(
      'Password is required.',
    );
  });

  it('should display invalid email and password length messages', () => {
    component['loginForm'].controls.email.setValue(
      'invalid-email',
    );

    component['loginForm'].controls.password.setValue('123');

    component['submit']();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(
      'Enter a valid email address.',
    );

    expect(compiled.textContent).toContain(
      'Password must be at least 6 characters.',
    );
  });

  it('should toggle password visibility', () => {
    expect(component['showPassword']).toBe(false);

    component['togglePassword']();

    expect(component['showPassword']).toBe(true);

    component['togglePassword']();

    expect(component['showPassword']).toBe(false);
  });

  it('should update the password input type and toggle label', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    let passwordInput = compiled.querySelector(
      '#password',
    ) as HTMLInputElement;

    let toggleButton = compiled.querySelector(
      '.password-toggle',
    ) as HTMLButtonElement;

    expect(passwordInput.type).toBe('password');

    expect(toggleButton.getAttribute('aria-label')).toBe(
      'Show password',
    );

    toggleButton.click();
    fixture.detectChanges();

    passwordInput = compiled.querySelector(
      '#password',
    ) as HTMLInputElement;

    toggleButton = compiled.querySelector(
      '.password-toggle',
    ) as HTMLButtonElement;

    expect(passwordInput.type).toBe('text');

    expect(toggleButton.getAttribute('aria-label')).toBe(
      'Hide password',
    );
  });

  it('should show the loading state when submitting', () => {
    component.isSubmitting.set(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

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

    const button = fixture.nativeElement.querySelector(
      '.login-button',
    ) as HTMLButtonElement;

    expect(button.disabled).toBe(true);
  });

  it('should display the login error when one exists', () => {
    component.loginError.set(
      'Invalid email or password.',
    );
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector('.login-status'),
    ).toBeTruthy();

    expect(compiled.textContent).toContain(
      'Invalid email or password.',
    );
  });

  it('should label the login form with the page heading', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const form = compiled.querySelector('form');
    const heading = compiled.querySelector('#login-title');

    expect(heading).toBeTruthy();

    expect(form?.getAttribute('aria-labelledby')).toBe(
      'login-title',
    );
  });

  it('should expose login errors as an accessible alert', () => {
    component.loginError.set(
      'Invalid email or password.',
    );
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const status = compiled.querySelector('.login-status');

    expect(status?.getAttribute('role')).toBe('alert');

    expect(status?.getAttribute('aria-live')).toBe(
      'assertive',
    );
  });

  it('should call the login API with normalized email and password', () => {
    authApiService.login.mockReturnValue(
      of({
        accessToken: 'test-jwt-token',
        tokenType: 'Bearer',
      }),
    );

    component['loginForm'].setValue({
      email: '  USER@EXAMPLE.COM  ',
      password: 'password123',
      rememberMe: false,
    });

    component['submit']();

    expect(authApiService.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
  });

  it('should store the JWT and navigate to dashboard after successful login', () => {
    authApiService.login.mockReturnValue(
      of({
        accessToken: 'test-jwt-token',
        tokenType: 'Bearer',
      }),
    );

    component['loginForm'].setValue({
      email: 'user@example.com',
      password: 'password123',
      rememberMe: false,
    });

    component['submit']();

    expect(auth.setToken).toHaveBeenCalledWith(
      'test-jwt-token',
    );

    expect(router.navigate).toHaveBeenCalledWith([
      '/dashboard',
    ]);

    expect(component.isSubmitting()).toBe(false);
    expect(component.loginError()).toBe('');
  });

  it('should display the backend authentication error on 401', () => {
    const error = new HttpErrorResponse({
      status: 401,
      statusText: 'Unauthorized',
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      },
    });

    authApiService.login.mockReturnValue(
      throwError(() => error),
    );

    component['loginForm'].setValue({
      email: 'wrong@example.com',
      password: 'wrong-password',
      rememberMe: false,
    });

    component['submit']();
    fixture.detectChanges();

    expect(component.loginError()).toBe(
      'Invalid email or password',
    );

    expect(auth.setToken).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.isSubmitting()).toBe(false);
  });

  it('should display a generic error for unexpected server failures', () => {
    const error = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error',
    });

    authApiService.login.mockReturnValue(
      throwError(() => error),
    );

    component['loginForm'].setValue({
      email: 'user@example.com',
      password: 'password123',
      rememberMe: false,
    });

    component['submit']();
    fixture.detectChanges();

    expect(component.loginError()).toBe(
      'Unable to sign in. Please try again.',
    );

    expect(component.isSubmitting()).toBe(false);
  });

  it('should ignore another submit while a login request is already in progress', () => {
    component.isSubmitting.set(true);

    component['loginForm'].setValue({
      email: 'user@example.com',
      password: 'password123',
      rememberMe: false,
    });

    component['submit']();

    expect(authApiService.login).not.toHaveBeenCalled();
  });

  it('should show an error when the authentication response has no access token', () => {
    authApiService.login.mockReturnValue(
      of({
        accessToken: '',
        tokenType: 'Bearer',
      }),
    );

    component['loginForm'].setValue({
      email: 'user@example.com',
      password: 'password123',
      rememberMe: false,
    });

    component['submit']();
    fixture.detectChanges();

    expect(component.loginError()).toBe(
      'Unable to sign in. Invalid authentication response.',
    );

    expect(auth.setToken).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.isSubmitting()).toBe(false);
  });
});
