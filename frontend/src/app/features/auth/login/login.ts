import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

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

  constructor(private readonly formBuilder: FormBuilder) {
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

    /*
     * The real authentication API will be connected here
     * after the backend login contract is finalized.
     *
     * The API integration will:
     * 1. Set isSubmitting to true.
     * 2. Call the authentication endpoint.
     * 3. Store the returned JWT.
     * 4. Navigate to the dashboard.
     * 5. Set loginError when authentication fails.
     * 6. Set isSubmitting back to false when finished.
     */
  }

  protected togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
