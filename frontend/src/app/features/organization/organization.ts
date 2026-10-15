import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  OrganizationRecord,
  OrganizationService,
} from './organization.service';

@Component({
  selector: 'app-organization',
  imports: [ReactiveFormsModule],
  templateUrl: './organization.html',
  styleUrl: './organization.css',
})
export class Organization {
  readonly isEditing = signal(false);
  readonly editSubmitted = signal(false);

  organization: OrganizationRecord;

  readonly organizationForm;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly organizationService: OrganizationService,
  ) {
    this.organization =
      this.organizationService.organizationData();

    this.organizationForm =
      this.formBuilder.nonNullable.group({
        name: [
          this.organization.name,
          [
            Validators.required,
            Validators.minLength(2),
          ],
        ],
        code: [
          this.organization.code,
          [Validators.required],
        ],
        industry: [
          this.organization.industry,
          [Validators.required],
        ],
        email: [
          this.organization.email,
          [
            Validators.required,
            Validators.email,
          ],
        ],
        phone: [
          this.organization.phone,
          [Validators.required],
        ],
        address: [
          this.organization.address,
          [Validators.required],
        ],
      });
  }

  startEditing(): void {
    this.organizationForm.patchValue({
      name: this.organization.name,
      code: this.organization.code,
      industry: this.organization.industry,
      email: this.organization.email,
      phone: this.organization.phone,
      address: this.organization.address,
    });

    this.editSubmitted.set(false);
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    this.organizationForm.reset({
      name: this.organization.name,
      code: this.organization.code,
      industry: this.organization.industry,
      email: this.organization.email,
      phone: this.organization.phone,
      address: this.organization.address,
    });

    this.editSubmitted.set(false);
    this.isEditing.set(false);
  }

  saveOrganization(): void {
    this.editSubmitted.set(true);

    if (this.organizationForm.invalid) {
      this.organizationForm.markAllAsTouched();
      return;
    }

    const formValue =
      this.organizationForm.getRawValue();

    this.organizationService.updateOrganization({
      name: formValue.name.trim(),
      code: formValue.code.trim(),
      industry: formValue.industry.trim(),
      email: formValue.email.trim().toLowerCase(),
      phone: formValue.phone.trim(),
      address: formValue.address.trim(),
    });

    this.organization =
      this.organizationService.organizationData();

    this.editSubmitted.set(false);
    this.isEditing.set(false);
  }

  toggleEdit(): void {
    if (this.isEditing()) {
      this.cancelEditing();
    } else {
      this.startEditing();
    }
  }
}
