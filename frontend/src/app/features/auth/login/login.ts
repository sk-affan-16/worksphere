import {
  Component,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  HttpErrorResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { Auth } from '../../../core/auth/auth';
import { AuthApiService } from '../../../core/auth/auth-api.service';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

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

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    const request = {
      email: this.loginForm.controls.email.value
        .trim()
        .toLowerCase(),
      password: this.loginForm.controls.password.value,
    };

    this.authApiService
      .login(request)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.auth.setToken(response.accessToken);
          void this.router.navigate(['/dashboard']);
        },
        error: (error: unknown) => {
          if (
            error instanceof HttpErrorResponse &&
            error.status === 401
          ) {
            this.loginError.set(
              'Invalid email or password.',
            );
            return;
          }

          if (
            error instanceof HttpErrorResponse &&
            typeof error.error?.message === 'string'
          ) {
            this.loginError.set(
              error.error.message,
            );
            return;
          }

          this.loginError.set(
            'Unable to sign in. Please try again.',
          );
        },
      });
  }

  protected togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
