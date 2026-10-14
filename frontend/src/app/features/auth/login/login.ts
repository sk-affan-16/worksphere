import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { ErrorMessage } from '../../../shared/components/error-message/error-message';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { AuthApiService } from '../../../core/auth/auth-api.service';
import { Auth } from '../../../core/auth/auth';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    ErrorMessage,
    LoadingSpinner,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  protected readonly loginForm;

  readonly isSubmitting = signal(false);
  readonly loginError = signal('');

  protected submitted = false;
  protected showPassword = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authApiService: AuthApiService,
    private readonly auth: Auth,
    private readonly router: Router,
  ) {
    this.loginForm = this.formBuilder.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  protected submit(): void {
    this.submitted = true;
    this.loginError.set('');

    const emailControl = this.loginForm.controls.email;
    const normalizedEmail = emailControl.value
      .trim()
      .toLowerCase();

    if (emailControl.value !== normalizedEmail) {
      emailControl.setValue(normalizedEmail);
    }

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.loginForm.getRawValue();

    this.authApiService
      .login({
        email: formValue.email,
        password: formValue.password,
      })
      .subscribe({
        next: (response) => {
          if (!response.accessToken) {
            this.loginError.set(
              'Unable to sign in. Invalid authentication response.',
            );
            this.isSubmitting.set(false);
            return;
          }

          this.auth.setToken(
            response.accessToken,
            formValue.rememberMe,
          );
          this.isSubmitting.set(false);

          void this.router.navigate(['/dashboard']);
        },

        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse) {
            const backendMessage =
              typeof error.error?.message === 'string'
                ? error.error.message
                : '';

            this.loginError.set(
              backendMessage ||
              'Unable to sign in. Please try again.',
            );
          } else {
            this.loginError.set(
              'Unable to sign in. Please try again.',
            );
          }

          this.isSubmitting.set(false);
        },
      });
  }

  protected togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
