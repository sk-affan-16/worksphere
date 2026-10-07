import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { EmptyState } from '../../shared/components/empty-state/empty-state';

type EmployeeStatus = 'Active' | 'Inactive';

interface DemoEmployee {
  name: string;
  email: string;
  department: string;
  role: string;
  status: EmployeeStatus;
}

@Component({
  selector: 'app-employees',
  imports: [FormsModule, EmptyState],
  templateUrl: './employees.html',
  styleUrl: './employees.css',
})
export class Employees {
  readonly searchTerm = signal('');
  readonly statusFilter = signal<'All' | EmployeeStatus>('All');

  /*
   * Temporary frontend demo data.
   * This is not the backend employee API contract.
   */
  private readonly demoEmployees: DemoEmployee[] = [
    {
      name: 'Aarav Sharma',
      email: 'aarav@example.com',
      department: 'Engineering',
      role: 'Software Engineer',
      status: 'Active',
    },
    {
      name: 'Priya Das',
      email: 'priya@example.com',
      department: 'Human Resources',
      role: 'HR Manager',
      status: 'Active',
    },
    {
      name: 'Rahul Verma',
      email: 'rahul@example.com',
      department: 'Finance',
      role: 'Financial Analyst',
      status: 'Active',
    },
    {
      name: 'Sneha Patel',
      email: 'sneha@example.com',
      department: 'Operations',
      role: 'Operations Executive',
      status: 'Inactive',
    },
    {
      name: 'Aditya Singh',
      email: 'aditya@example.com',
      department: 'Engineering',
      role: 'QA Engineer',
      status: 'Active',
    },
    {
      name: 'Neha Roy',
      email: 'neha@example.com',
      department: 'Marketing',
      role: 'Marketing Specialist',
      status: 'Active',
    },
  ];

  readonly filteredEmployees = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.demoEmployees.filter((employee) => {
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
    employee: DemoEmployee,
  ): string {
    return employee.email;
  }
}
