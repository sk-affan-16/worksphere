import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthApiService } from '../../../core/auth/auth-api.service';

const passwordsMatchValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword
    ? null
    : { passwordsMismatch: true };
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly successMessage = signal('');
  readonly errorMessage = signal('');

  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  readonly selectedPhoto = signal<File | null>(null);
  readonly photoPreview = signal<string | null>(null);
  readonly photoError = signal('');

  private photoObjectUrl: string | null = null;

  readonly registerForm = this.formBuilder.nonNullable.group(
    {
      organizationName: [
        '',
        [
          Validators.required,
          Validators.maxLength(150),
        ],
      ],

      firstName: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
        ],
      ],

      lastName: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
        ],
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.maxLength(254),
        ],
      ],

      jobTitle: [
        '',
        [
          Validators.required,
          Validators.maxLength(120),
        ],
      ],

      department: [
        '',
        [
          Validators.required,
          Validators.maxLength(120),
        ],
      ],

      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[+]?[\d\s()-]{7,30}$/),
        ],
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(12),
          Validators.maxLength(72),
        ],
      ],

      confirmPassword: [
        '',
        [Validators.required],
      ],
    },
    {
      validators: passwordsMatchValidator,
    },
  );

  get passwordsMismatch(): boolean {
    return (
      this.registerForm.hasError('passwordsMismatch') &&
      !!this.registerForm.controls.confirmPassword.value
    );
  }

  get photoInitial(): string {
    const firstName = this.registerForm.controls.firstName.value.trim();

    return firstName ? firstName.charAt(0).toUpperCase() : 'U';
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((value) => !value);
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.photoError.set('');

    if (!file) {
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
    ];

    const maxFileSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      this.photoError.set(
        'Please select a JPG or PNG image.',
      );

      input.value = '';
      return;
    }

    if (file.size > maxFileSize) {
      this.photoError.set(
        'Your profile photo must be 2 MB or smaller.',
      );

      input.value = '';
      return;
    }

    this.clearPhotoPreview();

    this.selectedPhoto.set(file);

    this.photoObjectUrl = URL.createObjectURL(file);
    this.photoPreview.set(this.photoObjectUrl);
  }

  removePhoto(input?: HTMLInputElement): void {
    this.clearPhotoPreview();

    this.selectedPhoto.set(null);
    this.photoError.set('');

    if (input) {
      input.value = '';
    }
  }

  private clearPhotoPreview(): void {
    if (this.photoObjectUrl) {
      URL.revokeObjectURL(this.photoObjectUrl);
      this.photoObjectUrl = null;
    }

    this.photoPreview.set(null);
  }

  onSubmit(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const formValue = this.registerForm.getRawValue();

    if (formValue.password !== formValue.confirmPassword) {
      this.registerForm.controls.confirmPassword.markAsTouched();

      this.errorMessage.set(
        'Your password and confirmation password do not match.',
      );

      return;
    }

    this.isSubmitting.set(true);

    this.authApi
      .register(
        {
          organizationName: formValue.organizationName.trim(),
          firstName: formValue.firstName.trim(),
          lastName: formValue.lastName.trim(),
          email: formValue.email.trim(),
          jobTitle: formValue.jobTitle.trim(),
          department: formValue.department.trim(),
          phone: formValue.phone.trim(),
          password: formValue.password,
        },
        this.selectedPhoto(),
      )
      .subscribe({

        next: (response) => {
          this.isSubmitting.set(false);

          this.successMessage.set(
            response.message ||
            'Your organization account has been created successfully.',
          );

          setTimeout(() => {
            void this.router.navigate(['/login'], {
              queryParams: { registered: 'true' },
            });
          }, 1500);
        },

        error: (error: HttpErrorResponse) => {
          this.isSubmitting.set(false);

          if (error.status === 409) {
            this.errorMessage.set(
              'This email address is already registered. Please use another email.',
            );
            return;
          }

          if (error.status === 400) {
            this.errorMessage.set(
              'Please check your information. Your email, phone number, or password may be invalid.',
            );
            return;
          }

          if (error.status === 0) {
            this.errorMessage.set(
              'Cannot connect to the server. Please check that the backend is running.',
            );
            return;
          }

          this.errorMessage.set(
            error.error?.message ||
            'Registration failed. Please try again.',
          );
        },
      });
  }

  ngOnDestroy(): void {
    this.clearPhotoPreview();
  }
}
