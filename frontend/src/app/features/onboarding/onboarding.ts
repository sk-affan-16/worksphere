import { Component, computed, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { EmptyState } from '../../shared/components/empty-state/empty-state';
import {
  OnboardingRecord,
  OnboardingService,
  OnboardingStatus,
} from './onboarding.service';

@Component({
  selector: 'app-onboarding',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    EmptyState,
  ],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.css',
})
export class Onboarding {
  readonly startOnboardingForm;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly onboardingService: OnboardingService,
  ) {
    this.startOnboardingForm =
      this.formBuilder.nonNullable.group({
        employee: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
          ],
        ],
        department: [
          '',
          [Validators.required],
        ],
        startDate: [
          '',
          [Validators.required],
        ],
      });
  }

  readonly startOnboardingSubmitted = signal(false);
  readonly isStartOnboardingOpen = signal(false);

  readonly searchTerm = signal('');
  readonly statusFilter =
    signal<'All' | OnboardingStatus>('All');

  readonly filteredOnboarding = computed(() => {
    const search =
      this.searchTerm().trim().toLowerCase();

    const status = this.statusFilter();

    return this.onboardingService
      .onboardingList()
      .filter((item) => {
        const matchesSearch =
          !search ||
          item.employee
            .toLowerCase()
            .includes(search) ||
          item.department
            .toLowerCase()
            .includes(search);

        const matchesStatus =
          status === 'All' ||
          item.status === status;

        return matchesSearch && matchesStatus;
      });
  });

  openStartOnboarding(): void {
    this.startOnboardingSubmitted.set(false);
    this.isStartOnboardingOpen.set(true);
  }

  closeStartOnboarding(): void {
    this.startOnboardingSubmitted.set(false);

    this.startOnboardingForm.reset({
      employee: '',
      department: '',
      startDate: '',
    });

    this.isStartOnboardingOpen.set(false);
  }

  saveOnboarding(): void {
    this.startOnboardingSubmitted.set(true);

    if (this.startOnboardingForm.invalid) {
      this.startOnboardingForm.markAllAsTouched();
      return;
    }

    const formValue =
      this.startOnboardingForm.getRawValue();

    const record: OnboardingRecord = {
      employee: formValue.employee.trim(),
      department: formValue.department.trim(),
      startDate: formValue.startDate,
      progress: 0,
      status: 'Not Started',
    };

    this.onboardingService.addOnboarding(record);

    this.startOnboardingForm.reset({
      employee: '',
      department: '',
      startDate: '',
    });

    this.startOnboardingSubmitted.set(false);
    this.isStartOnboardingOpen.set(false);
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
  }

  updateStatus(value: string): void {
    if (
      value === 'All' ||
      value === 'Not Started' ||
      value === 'In Progress' ||
      value === 'Completed'
    ) {
      this.statusFilter.set(value);
    }
  }

  protected trackOnboarding(
    _index: number,
    item: OnboardingRecord,
  ): string {
    return item.employee;
  }
}
