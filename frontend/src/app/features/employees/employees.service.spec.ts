import { TestBed } from '@angular/core/testing';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import {
  EmployeeRecord,
  EmployeesService,
} from './employees.service';

describe('EmployeesService', () => {
  const storageKey = 'worksphere_employees';

  beforeEach(() => {
    localStorage.removeItem(storageKey);

    TestBed.configureTestingModule({
      providers: [EmployeesService],
    });
  });

  afterEach(() => {
    localStorage.removeItem(storageKey);
    TestBed.resetTestingModule();
  });

  it('should create the service', () => {
    const service = TestBed.inject(EmployeesService);

    expect(service).toBeTruthy();
  });

  it('should load the default employees when storage is empty', () => {
    const service = TestBed.inject(EmployeesService);

    expect(service.employeeList().length).toBe(6);
  });

  it('should add a new employee to the employee list', () => {
    const service = TestBed.inject(EmployeesService);

    const newEmployee: EmployeeRecord = {
      name: 'Maya Sen',
      email: 'maya@example.com',
      department: 'Engineering',
      role: 'Frontend Developer',
      status: 'Active',
    };

    service.addEmployee(newEmployee);

    expect(service.employeeList().length).toBe(7);
    expect(service.employeeList()[6]).toEqual(newEmployee);
  });

  it('should persist a newly added employee to localStorage', () => {
    const service = TestBed.inject(EmployeesService);

    const newEmployee: EmployeeRecord = {
      name: 'Maya Sen',
      email: 'maya@example.com',
      department: 'Engineering',
      role: 'Frontend Developer',
      status: 'Active',
    };

    service.addEmployee(newEmployee);

    const storedEmployees = JSON.parse(
      localStorage.getItem(storageKey) ?? '[]',
    ) as EmployeeRecord[];

    expect(storedEmployees.length).toBe(7);
    expect(storedEmployees[6]).toEqual(newEmployee);
  });

  it('should load previously stored employees', () => {
    const storedEmployees: EmployeeRecord[] = [
      {
        name: 'Stored Employee',
        email: 'stored@example.com',
        department: 'Finance',
        role: 'Financial Analyst',
        status: 'Inactive',
      },
    ];

    localStorage.setItem(
      storageKey,
      JSON.stringify(storedEmployees),
    );

    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [EmployeesService],
    });

    const service = TestBed.inject(EmployeesService);

    expect(service.employeeList()).toEqual(storedEmployees);
  });

  it('should fall back to default employees when stored JSON is invalid', () => {
    localStorage.setItem(
      storageKey,
      'invalid-json',
    );

    const service = TestBed.inject(EmployeesService);

    expect(service.employeeList().length).toBe(6);
  });
});
