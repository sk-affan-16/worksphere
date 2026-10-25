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
  CreateEmployeeRequest,
  EmployeeResponse,
  EmployeeService,
} from './employee.service';

type EmployeeStatusFilter = 'All' | 'Active' | 'Inactive';

@Component({
  selector: 'app-employees',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    EmptyState,
  ],
  templateUrl: './employees.html',
  styleUrl: './employees.css',
})
export class Employees {
  readonly addEmployeeForm;

  readonly employees = signal<EmployeeResponse[]>([]);
  readonly isLoading = signal(true);
  readonly loadError = signal('');
  readonly isSaving = signal(false);
  readonly saveError = signal('');

  readonly addEmployeeSubmitted = signal(false);
  readonly isAddEmployeeOpen = signal(false);

  readonly searchTerm = signal('');
  readonly statusFilter = signal<EmployeeStatusFilter>('All');

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly employeeService: EmployeeService,
  ) {
    this.addEmployeeForm = this.formBuilder.nonNullable.group({
      firstName: ['', [
        Validators.required,
        Validators.maxLength(100),
      ]],
      lastName: ['', [
        Validators.required,
        Validators.maxLength(100),
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(254),
      ]],
      password: ['', [
        Validators.required,
      ]],
      phone: ['', [
        Validators.maxLength(30),
      ]],
      department: ['', [
        Validators.maxLength(120),
      ]],
      role: ['', [
        Validators.maxLength(120),
      ]],
      hireDate: [''],
    });

    this.loadEmployees();
  }

  readonly filteredEmployees = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.employees().filter((employee) => {
      const fullName =
        `${employee.firstName} ${employee.lastName}`.trim();

      const matchesSearch =
        !search ||
        fullName.toLowerCase().includes(search) ||
        employee.email.toLowerCase().includes(search) ||
        (employee.department ?? '').toLowerCase().includes(search) ||
        (employee.jobTitle ?? '').toLowerCase().includes(search);

      const matchesStatus =
        status === 'All' ||
        (status === 'Active' && employee.status === 'ACTIVE') ||
        (status === 'Inactive' && employee.status === 'DISABLED');

      return matchesSearch && matchesStatus;
    });
  });

  loadEmployees(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees.set(employees);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.loadError.set(this.getErrorMessage(error));
        this.isLoading.set(false);
      },
    });
  }

  openAddEmployee(): void {
    this.saveError.set('');
    this.addEmployeeSubmitted.set(false);
    this.isAddEmployeeOpen.set(true);
  }

  closeAddEmployee(): void {
    this.isAddEmployeeOpen.set(false);
    this.saveError.set('');
    this.addEmployeeSubmitted.set(false);
  }

  saveEmployee(): void {
    this.addEmployeeSubmitted.set(true);
    this.saveError.set('');

    if (this.addEmployeeForm.invalid) {
      this.addEmployeeForm.markAllAsTouched();
      return;
    }

    const formValue = this.addEmployeeForm.getRawValue();

    const request: CreateEmployeeRequest = {
      firstName: formValue.firstName.trim(),
      lastName: formValue.lastName.trim(),
      email: formValue.email.trim().toLowerCase(),
      password: formValue.password,
      phone: this.toNullableValue(formValue.phone),
      jobTitle: this.toNullableValue(formValue.role),
      department: this.toNullableValue(formValue.department),
      hireDate: formValue.hireDate || null,
    };

    this.isSaving.set(true);

    this.employeeService.createEmployee(request).subscribe({
      next: (employee) => {
        this.employees.update((employees) => [
          ...employees,
          employee,
        ]);

        this.resetAddEmployeeForm();
        this.isSaving.set(false);
        this.isAddEmployeeOpen.set(false);
      },
      error: (error: unknown) => {
        this.saveError.set(this.getErrorMessage(error));
        this.isSaving.set(false);
      },
    });
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
  }

  updateStatus(value: string): void {
    if (
      value === 'Active' ||
      value === 'Inactive' ||
      value === 'All'
    ) {
      this.statusFilter.set(value);
    }
  }

  getStatusLabel(status: EmployeeResponse['status']): string {
    return status === 'ACTIVE' ? 'Active' : 'Inactive';
  }

  protected trackEmployee(
    _index: number,
    employee: EmployeeResponse,
  ): number {
    return employee.id;
  }

  private resetAddEmployeeForm(): void {
    this.addEmployeeForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      department: '',
      role: '',
      hireDate: '',
    });

    this.addEmployeeSubmitted.set(false);
    this.saveError.set('');
  }

  private toNullableValue(value: string): string | null {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const backendMessage = error.error?.message;

      if (
        typeof backendMessage === 'string' &&
        backendMessage.trim()
      ) {
        return backendMessage;
      }

      if (error.status === 401) {
        return 'Your session has expired. Please log in again.';
      }

      if (error.status === 403) {
        return 'You are not authorized to manage employees.';
      }

      if (error.status === 404) {
        return 'Employee information was not found.';
      }

      if (error.status >= 500) {
        return 'The server could not process the request. Please try again.';
      }
    }

    return 'Unable to complete the employee request. Please try again.';
  }
}
