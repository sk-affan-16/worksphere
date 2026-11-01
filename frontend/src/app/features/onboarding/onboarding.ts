import { Component, computed, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { EmployeeResponse, EmployeeService } from '../employees/employee.service';
import { OnboardingResponse, OnboardingService, OnboardingStatus } from './onboarding.service';

interface OnboardingView {
  id: number;
  employeeId: number;
  employee: string;
  email: string;
  department: string;
  startDate: string;
  status: OnboardingStatus;
}

@Component({
  selector: 'app-onboarding',
  imports: [FormsModule, ReactiveFormsModule, EmptyState],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.css',
})
export class Onboarding implements OnInit {
  readonly startOnboardingForm;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly employeeService: EmployeeService,
    private readonly onboardingService: OnboardingService,
  ) {
    this.startOnboardingForm = this.formBuilder.nonNullable.group({
      employeeId: [0, [Validators.required, Validators.min(1)]],
    });
  }

  readonly employees = signal<EmployeeResponse[]>([]);
  readonly onboardings = signal<OnboardingView[]>([]);
  readonly selectedEmployee = signal<EmployeeResponse | null>(null);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly startOnboardingSubmitted = signal(false);
  readonly isStartOnboardingOpen = signal(false);

  readonly searchTerm = signal('');
  readonly statusFilter = signal<'All' | OnboardingStatus>('All');

  readonly filteredOnboarding = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.onboardings().filter((item) => {
      const matchesSearch =
        !search ||
        item.employee.toLowerCase().includes(search) ||
        item.department.toLowerCase().includes(search) ||
        item.email.toLowerCase().includes(search);

      const matchesStatus = status === 'All' || item.status === status;

      return matchesSearch && matchesStatus;
    });
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees.set(employees.filter((employee) => employee.status === 'ACTIVE'));

        this.loadOnboardings();
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Unable to load employees. Please try again.');
      },
    });
  }

  private loadOnboardings(): void {
    this.onboardingService.getOnboardings().subscribe({
      next: (records) => {
        this.onboardings.set(records.map((record) => this.toView(record)));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Unable to load onboarding records. Please try again.');
      },
    });
  }

  private toView(record: OnboardingResponse): OnboardingView {
    const employee = this.employees().find((item) => item.id === record.employeeId);

    return {
      id: record.id,
      employeeId: record.employeeId,
      employee: record.employeeName,
      email: record.employeeEmail,
      department: employee?.department ?? 'Not available',
      startDate: employee?.hireDate ?? 'Not available',
      status: record.status,
    };
  }

  onEmployeeSelected(employeeId: number): void {
    const employee = this.employees().find((item) => item.id === Number(employeeId));

    this.selectedEmployee.set(employee ?? null);
  }

  openStartOnboarding(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.startOnboardingForm.reset({ employeeId: 0 });
    this.selectedEmployee.set(null);
    this.startOnboardingSubmitted.set(false);
    this.isStartOnboardingOpen.set(true);
  }

  closeStartOnboarding(): void {
    this.isStartOnboardingOpen.set(false);
    this.selectedEmployee.set(null);
    this.startOnboardingForm.reset({ employeeId: 0 });
    this.startOnboardingSubmitted.set(false);
  }

  saveOnboarding(): void {
    this.startOnboardingSubmitted.set(true);
    this.errorMessage.set('');

    if (this.startOnboardingForm.invalid) {
      this.startOnboardingForm.markAllAsTouched();
      return;
    }

    const employeeId = this.startOnboardingForm.getRawValue().employeeId;

    this.saving.set(true);

    this.onboardingService.createOnboarding({ employeeId }).subscribe({
      next: (record) => {
        this.onboardings.update((records) => [...records, this.toView(record)]);

        this.saving.set(false);
        this.successMessage.set('Onboarding created successfully.');
        this.closeStartOnboarding();
      },
      error: (error: unknown) => {
        this.saving.set(false);

        const message =
          typeof error === 'object' &&
          error !== null &&
          'error' in error &&
          typeof error.error === 'object' &&
          error.error !== null &&
          'message' in error.error &&
          typeof error.error.message === 'string'
            ? error.error.message
            : 'Unable to create onboarding. Please try again.';

        this.errorMessage.set(message);
      },
    });
  }

  updateOnboardingRecordStatus(id: number, status: string): void {
    if (status !== 'NOT_STARTED' && status !== 'IN_PROGRESS' && status !== 'COMPLETED') {
      return;
    }

    this.errorMessage.set('');

    this.onboardingService.updateOnboardingStatus(id, { status }).subscribe({
      next: (updated) => {
        this.onboardings.update((records) =>
          records.map((item) => (item.id === id ? this.toView(updated) : item)),
        );
        this.successMessage.set('Onboarding status updated.');
      },
      error: () => {
        this.errorMessage.set('Unable to update onboarding status. Please try again.');
      },
    });
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
  }

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

  statusLabel(status: OnboardingStatus): string {
    switch (status) {
      case 'NOT_STARTED':
        return 'Not Started';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
    }
  }

  protected trackOnboarding(_index: number, item: OnboardingView): number {
    return item.id;
  }
}
