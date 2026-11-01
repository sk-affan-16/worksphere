
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, signal } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { EmptyState } from '../../shared/components/empty-state/empty-state';

import {
  EmployeeResponse,
  EmployeeService,
} from '../employees/employee.service';

import {
  OnboardingResponse,
  OnboardingService,
  OnboardingStatus,
} from './onboarding.service';

@Component({
  selector: 'app-onboarding',
  imports: [
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    EmptyState,
  ],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.css',
})
export class Onboarding {

  // --------------------------------------------------
  // FORM
  // --------------------------------------------------

  readonly startOnboardingForm;

  // --------------------------------------------------
  // DATA SIGNALS
  // --------------------------------------------------

  readonly employees = signal<EmployeeResponse[]>([]);

  readonly onboardings = signal<OnboardingResponse[]>([]);

  // --------------------------------------------------
  // LOADING AND REQUEST STATES
  // --------------------------------------------------

  readonly isLoading = signal(true);

  readonly isLoadingEmployees = signal(false);

  readonly isSaving = signal(false);

  readonly updatingOnboardingId = signal<number | null>(null);

  // --------------------------------------------------
  // MESSAGES
  // --------------------------------------------------

  readonly errorMessage = signal('');

  readonly employeeError = signal('');

  readonly successMessage = signal('');

  // --------------------------------------------------
  // FORM AND UI STATES
  // --------------------------------------------------

  readonly startOnboardingSubmitted = signal(false);

  readonly isStartOnboardingOpen = signal(false);

  readonly searchTerm = signal('');

  readonly statusFilter = signal<'All' | OnboardingStatus>('All');

  // --------------------------------------------------
  // AVAILABLE ONBOARDING STATUSES
  // --------------------------------------------------

  readonly statusOptions: {
    value: OnboardingStatus;
    label: string;
  }[] = [
    {
      value: 'NOT_STARTED',
      label: 'Not Started',
    },
    {
      value: 'IN_PROGRESS',
      label: 'In Progress',
    },
    {
      value: 'COMPLETED',
      label: 'Completed',
    },
  ];

  // --------------------------------------------------
  // ACTIVE EMPLOYEES WITHOUT EXISTING ONBOARDING
  // --------------------------------------------------

  readonly availableEmployees = computed(() => {
    const existingEmployeeIds = new Set(
      this.onboardings().map(
        (item) => item.employeeId,
      ),
    );

    return this.employees().filter(
      (employee) =>
        employee.status === 'ACTIVE' &&
        !existingEmployeeIds.has(employee.id),
    );
  });

  // --------------------------------------------------
  // SEARCH AND STATUS FILTER
  // --------------------------------------------------

  readonly filteredOnboarding = computed(() => {
    const search = this.searchTerm()
      .trim()
      .toLowerCase();

    const status = this.statusFilter();

    return this.onboardings().filter((item) => {

      const employeeName = item.employeeName.toLowerCase();

      const employeeEmail = item.employeeEmail.toLowerCase();

      const department = this.getDepartment(
        item.employeeId,
      ).toLowerCase();

      const matchesSearch =
        !search ||
        employeeName.includes(search) ||
        employeeEmail.includes(search) ||
        department.includes(search);

      const matchesStatus =
        status === 'All' ||
        item.status === status;

      return matchesSearch && matchesStatus;
    });
  });

  // --------------------------------------------------
  // CONSTRUCTOR
  // --------------------------------------------------

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly employeeService: EmployeeService,
    private readonly onboardingService: OnboardingService,
  ) {

    this.startOnboardingForm =
      this.formBuilder.nonNullable.group({

        employeeId: [
          0,
          [
            Validators.required,
            Validators.min(1),
          ],
        ],

      });

    // Load employees and onboarding records
    // when the component is initialized.

    this.loadEmployees();

    this.loadOnboardings();
  }

  // --------------------------------------------------
  // LOAD EMPLOYEES
  // --------------------------------------------------

  loadEmployees(): void {

    this.isLoadingEmployees.set(true);

    this.employeeError.set('');

    this.employeeService.getEmployees().subscribe({

      next: (employees) => {

        this.employees.set(employees);

        this.isLoadingEmployees.set(false);

      },

      error: (error: unknown) => {

        this.employeeError.set(
          this.getErrorMessage(error),
        );

        this.isLoadingEmployees.set(false);

      },

    });

  }

  // --------------------------------------------------
  // LOAD ONBOARDING RECORDS
  // --------------------------------------------------

  loadOnboardings(): void {

    this.isLoading.set(true);

    this.errorMessage.set('');

    this.onboardingService.getOnboardings().subscribe({

      next: (records) => {

        this.onboardings.set(records);

        this.isLoading.set(false);

      },

      error: (error: unknown) => {

        this.errorMessage.set(
          this.getErrorMessage(error),
        );

        this.isLoading.set(false);

      },

    });

  }

  // --------------------------------------------------
  // OPEN ONBOARDING FORM
  // --------------------------------------------------

  openStartOnboarding(): void {

    this.errorMessage.set('');

    this.successMessage.set('');

    this.startOnboardingSubmitted.set(false);

    this.startOnboardingForm.reset({
      employeeId: 0,
    });

    this.isStartOnboardingOpen.set(true);

  }

  // --------------------------------------------------
  // CLOSE ONBOARDING FORM
  // --------------------------------------------------

  closeStartOnboarding(): void {

    this.isStartOnboardingOpen.set(false);

    this.startOnboardingSubmitted.set(false);

    this.startOnboardingForm.reset({
      employeeId: 0,
    });

  }

  // --------------------------------------------------
  // CREATE ONBOARDING
  // --------------------------------------------------

  saveOnboarding(): void {

    // Prevent duplicate submissions.

    if (this.isSaving()) {
      return;
    }

    this.startOnboardingSubmitted.set(true);

    this.errorMessage.set('');

    this.successMessage.set('');

    // Validate form.

    if (this.startOnboardingForm.invalid) {

      this.startOnboardingForm.markAllAsTouched();

      return;

    }

    const employeeId =
      this.startOnboardingForm.controls.employeeId.value;

    this.isSaving.set(true);

    // Backend request:
    // POST /api/onboardings
    // Body: { employeeId: number }

    this.onboardingService.createOnboarding({
      employeeId,
    }).subscribe({

      next: (createdOnboarding) => {

        // Add the newly created record to the list.

        this.onboardings.update((records) => [
          createdOnboarding,
          ...records,
        ]);

        this.isSaving.set(false);

        this.closeStartOnboarding();

        this.successMessage.set(
          'Employee onboarding created successfully.',
        );

      },

      error: (error: unknown) => {

        this.errorMessage.set(
          this.getErrorMessage(error),
        );

        this.isSaving.set(false);

      },

    });

  }

  // --------------------------------------------------
  // UPDATE ONBOARDING STATUS
  // --------------------------------------------------

  onStatusChange(
    item: OnboardingResponse,
    event: Event,
  ): void {

    const select = event.target as HTMLSelectElement | null;

    if (!select) {
      return;
    }

    const selectedStatus = select.value;

    // Check that the selected status is valid.

    const validStatus = this.statusOptions.some(
      (option) => option.value === selectedStatus,
    );

    if (!validStatus) {
      return;
    }

    const status = selectedStatus as OnboardingStatus;

    // Do nothing when the status has not changed.

    if (status === item.status) {
      return;
    }

    // Prevent multiple simultaneous updates
    // for the same onboarding record.

    if (this.updatingOnboardingId() === item.id) {
      return;
    }

    this.errorMessage.set('');

    this.successMessage.set('');

    this.updatingOnboardingId.set(item.id);

    // Backend request:
    // PATCH /api/onboardings/{id}/status
    // Body: { status: 'IN_PROGRESS' }

    this.onboardingService.updateOnboardingStatus(
      item.id,
      { status },
    ).subscribe({

      next: (updatedOnboarding) => {

        // Replace the old record with the updated record.

        this.onboardings.update((records) =>
          records.map((record) =>
            record.id === updatedOnboarding.id
              ? updatedOnboarding
              : record,
          ),
        );

        this.updatingOnboardingId.set(null);

        this.successMessage.set(
          'Onboarding status updated successfully.',
        );

      },

      error: (error: unknown) => {

        this.errorMessage.set(
          this.getErrorMessage(error),
        );

        this.updatingOnboardingId.set(null);

        // Refresh the records to restore the actual
        // backend status without clearing the error message.

        this.refreshOnboardingsAfterFailedUpdate();

      },

    });

  }

  // --------------------------------------------------
  // REFRESH AFTER FAILED STATUS UPDATE
  // --------------------------------------------------

  private refreshOnboardingsAfterFailedUpdate(): void {

    this.onboardingService.getOnboardings().subscribe({

      next: (records) => {

        this.onboardings.set(records);

      },

      error: () => {

        // Keep the original status update error visible.
        // Do not replace it with another error message.

      },

    });

  }

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  updateSearch(value: string): void {

    this.searchTerm.set(value);

  }

  // --------------------------------------------------
  // STATUS FILTER
  // --------------------------------------------------

  updateStatus(value: string): void {

    if (
      value === 'All' ||
      value === 'NOT_STARTED' ||
      value === 'IN_PROGRESS' ||
      value === 'COMPLETED'
    ) {

      this.statusFilter.set(value);

    }

  }

  // --------------------------------------------------
  // GET STATUS LABEL
  // --------------------------------------------------

  getStatusLabel(status: OnboardingStatus): string {

    const option = this.statusOptions.find(
      (item) => item.value === status,
    );

    return option?.label ?? status;

  }

  // --------------------------------------------------
  // GET STATUS CSS CLASS
  // --------------------------------------------------

  getStatusClass(status: OnboardingStatus): string {

    switch (status) {

      case 'NOT_STARTED':
        return 'not-started';

      case 'IN_PROGRESS':
        return 'in-progress';

      case 'COMPLETED':
        return 'completed';

    }

  }

  // --------------------------------------------------
  // GET EMPLOYEE DEPARTMENT
  // --------------------------------------------------

  getDepartment(employeeId: number): string {

    const employee = this.employees().find(
      (item) => item.id === employeeId,
    );

    return employee?.department || 'Not specified';

  }

  // --------------------------------------------------
  // TRACK ONBOARDING RECORDS
  // --------------------------------------------------

  protected trackOnboarding(
    _index: number,
    item: OnboardingResponse,
  ): number {

    return item.id;

  }

  // --------------------------------------------------
  // CENTRALIZED ERROR HANDLING
  // --------------------------------------------------

  private getErrorMessage(error: unknown): string {

    if (error instanceof HttpErrorResponse) {

      const backendMessage = error.error?.message;

      // Prefer a meaningful message returned by backend.

      if (
        typeof backendMessage === 'string' &&
        backendMessage.trim()
      ) {

        return backendMessage;

      }

      // Network or backend connection error.

      if (error.status === 0) {

        return 'Cannot connect to the backend. Please check the server.';

      }

      // Invalid request.

      if (error.status === 400) {

        return 'Invalid onboarding information. Please check your selection.';

      }

      // Authentication error.

      if (error.status === 401) {

        return 'Your session has expired. Please log in again.';

      }

      // Authorization error.

      if (error.status === 403) {

        return 'Only authorized organization administrators can manage onboarding.';

      }

      // Record not found.

      if (error.status === 404) {

        return 'The selected employee or onboarding record was not found.';

      }

      // Duplicate onboarding.

      if (error.status === 409) {

        return 'Onboarding already exists for this employee.';

      }

      // Server error.

      if (error.status >= 500) {

        return 'The server encountered an error. Please try again.';

      }

    }

    return 'Something went wrong. Please try again.';

  }

}
