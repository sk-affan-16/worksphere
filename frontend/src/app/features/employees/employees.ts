import { Component, computed, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { EmptyState } from '../../shared/components/empty-state/empty-state';
import {
  EmployeeRecord,
  EmployeeStatus,
  EmployeesService,
} from './employees.service';

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

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly employeesService: EmployeesService,
  ) {
    this.addEmployeeForm = this.formBuilder.nonNullable.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      department: ['', [Validators.required]],
      role: ['', [Validators.required]],
    });
  }

  readonly addEmployeeSubmitted = signal(false);
  readonly isAddEmployeeOpen = signal(false);

  readonly searchTerm = signal('');
  readonly statusFilter = signal<'All' | EmployeeStatus>('All');

  openAddEmployee(): void {
    this.addEmployeeSubmitted.set(false);
    this.addEmployeeForm.reset({
      name: '',
      email: '',
      department: '',
      role: '',
    });
    this.isAddEmployeeOpen.set(true);
  }

  closeAddEmployee(): void {
    this.addEmployeeSubmitted.set(false);
    this.addEmployeeForm.reset({
      name: '',
      email: '',
      department: '',
      role: '',
    });
    this.isAddEmployeeOpen.set(false);
  }

  saveEmployee(): void {
    this.addEmployeeSubmitted.set(true);

    if (this.addEmployeeForm.invalid) {
      this.addEmployeeForm.markAllAsTouched();
      return;
    }

    const formValue = this.addEmployeeForm.getRawValue();

    const employee: EmployeeRecord = {
      name: formValue.name.trim(),
      email: formValue.email.trim().toLowerCase(),
      department: formValue.department.trim(),
      role: formValue.role.trim(),
      status: 'Active',
    };

    this.employeesService.addEmployee(employee);

    this.addEmployeeForm.reset({
      name: '',
      email: '',
      department: '',
      role: '',
    });

    this.addEmployeeSubmitted.set(false);
    this.isAddEmployeeOpen.set(false);
  }

  readonly filteredEmployees = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.employeesService.employeeList().filter((employee) => {
      const matchesSearch =
        !search ||
        employee.name.toLowerCase().includes(search) ||
        employee.email.toLowerCase().includes(search) ||
        employee.department.toLowerCase().includes(search) ||
        employee.role.toLowerCase().includes(search);

      const matchesStatus =
        status === 'All' || employee.status === status;

      return matchesSearch && matchesStatus;
    });
  });

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

  protected trackEmployee(
    _index: number,
    employee: EmployeeRecord,
  ): string {
    return employee.email;
  }
}
