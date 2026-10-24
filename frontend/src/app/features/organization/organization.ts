import {
  Component,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import {
  OrganizationResponse,
  OrganizationService,
} from './organization.service';

@Component({
  selector: 'app-organization',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './organization.html',
  styleUrl: './organization.css',
})
export class Organization implements OnInit {
  readonly isEditing = signal(false);
  readonly editSubmitted = signal(false);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);

  readonly loadError = signal('');
  readonly saveError = signal('');

  readonly organization = signal<
    OrganizationResponse | null
  >(null);

  readonly organizationForm;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly organizationService: OrganizationService,
  ) {
    this.organizationForm =
      this.formBuilder.nonNullable.group({
        name: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
          ],
        ],
      });
  }

  ngOnInit(): void {
    this.loadOrganization();
  }

  private loadOrganization(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    this.organizationService
      .getCurrentOrganization()
      .subscribe({
        next: (organization) => {
          this.organization.set(organization);

          this.organizationForm.reset({
            name: organization.name,
          });

          this.isLoading.set(false);
        },
        error: (error: unknown) => {
          this.isLoading.set(false);
          this.loadError.set(
            this.getErrorMessage(
              error,
              'Unable to load organization information.',
            ),
          );
        },
      });
  }

  startEditing(): void {
    const organization = this.organization();

    if (!organization) {
      return;
    }

    this.organizationForm.reset({
      name: organization.name,
    });

    this.editSubmitted.set(false);
    this.saveError.set('');
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    const organization = this.organization();

    if (organization) {
      this.organizationForm.reset({
        name: organization.name,
      });
    }

    this.editSubmitted.set(false);
    this.saveError.set('');
    this.isEditing.set(false);
  }

  saveOrganization(): void {
    this.editSubmitted.set(true);
    this.saveError.set('');

    if (this.organizationForm.invalid) {
      this.organizationForm.markAllAsTouched();
      return;
    }

    const name =
      this.organizationForm
        .getRawValue()
        .name.trim();

    this.isSaving.set(true);

    this.organizationService
      .updateCurrentOrganization({ name })
      .subscribe({
        next: (organization) => {
          this.organization.set(organization);

          this.organizationForm.reset({
            name: organization.name,
          });

          this.editSubmitted.set(false);
          this.isSaving.set(false);
          this.isEditing.set(false);
        },
        error: (error: unknown) => {
          this.isSaving.set(false);
          this.saveError.set(
            this.getErrorMessage(
              error,
              'Unable to update organization information.',
            ),
          );
        },
      });
  }

  toggleEdit(): void {
    if (this.isEditing()) {
      this.cancelEditing();
    } else {
      this.startEditing();
    }
  }

  private getErrorMessage(
    error: unknown,
    fallback: string,
  ): string {
    if (error instanceof HttpErrorResponse) {
      const backendMessage =
        error.error &&
        typeof error.error.message === 'string'
          ? error.error.message
          : '';

      if (backendMessage) {
        return backendMessage;
      }
    }

    return fallback;
  }
}
