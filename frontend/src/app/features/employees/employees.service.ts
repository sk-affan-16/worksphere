import { Injectable, signal } from '@angular/core';

export type EmployeeStatus =
  | 'Active'
  | 'Inactive';

export interface EmployeeRecord {
  name: string;
  email: string;
  department: string;
  role: string;
  status: EmployeeStatus;
}

@Injectable({
  providedIn: 'root',
})
export class EmployeesService {
  private readonly storageKey =
    'worksphere_employees';

  private readonly employees =
    signal<EmployeeRecord[]>(
      this.loadEmployees(),
    );

  readonly employeeList =
    this.employees.asReadonly();

  addEmployee(
    employee: EmployeeRecord,
  ): void {
    this.employees.update((employees) => {
      const updatedEmployees = [
        ...employees,
        employee,
      ];

      this.saveEmployees(updatedEmployees);

      return updatedEmployees;
    });
  }

  private loadEmployees(): EmployeeRecord[] {
    const storedEmployees = localStorage.getItem(
      this.storageKey,
    );

    if (!storedEmployees) {
      return this.getDefaultEmployees();
    }

    try {
      const parsedEmployees = JSON.parse(
        storedEmployees,
      );

      if (Array.isArray(parsedEmployees)) {
        return parsedEmployees as EmployeeRecord[];
      }
    } catch {
      // Fall back to the default demo data.
    }

    return this.getDefaultEmployees();
  }

  private saveEmployees(
    employees: EmployeeRecord[],
  ): void {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify(employees),
    );
  }

  private getDefaultEmployees(): EmployeeRecord[] {
    return [
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
  }
}
