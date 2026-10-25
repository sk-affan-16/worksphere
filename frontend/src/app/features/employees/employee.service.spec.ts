import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  provideHttpClient,
} from '@angular/common/http';

import {
  CreateEmployeeRequest,
  EmployeeResponse,
  EmployeeService,
  UpdateEmployeeRequest,
  UpdateEmployeeStatusRequest,
} from './employee.service';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let httpTesting: HttpTestingController;

  const employee: EmployeeResponse = {
    id: 1,
    userId: 10,
    firstName: 'Maya',
    lastName: 'Sen',
    email: 'maya@example.com',
    phone: '9876543210',
    jobTitle: 'Frontend Developer',
    department: 'Engineering',
    hireDate: '2026-10-01',
    status: 'ACTIVE',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EmployeeService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(EmployeeService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should get employees', () => {
    service.getEmployees().subscribe((employees) => {
      expect(employees).toEqual([employee]);
    });

    const request = httpTesting.expectOne('/api/employees');

    expect(request.request.method).toBe('GET');

    request.flush([employee]);
  });

  it('should get one employee', () => {
    service.getEmployee(1).subscribe((result) => {
      expect(result).toEqual(employee);
    });

    const request = httpTesting.expectOne('/api/employees/1');

    expect(request.request.method).toBe('GET');

    request.flush(employee);
  });

  it('should create an employee', () => {
    const payload: CreateEmployeeRequest = {
      firstName: 'Maya',
      lastName: 'Sen',
      email: 'maya@example.com',
      password: 'ValidPassword123',
      phone: '9876543210',
      jobTitle: 'Frontend Developer',
      department: 'Engineering',
      hireDate: '2026-10-01',
    };

    service.createEmployee(payload).subscribe((result) => {
      expect(result).toEqual(employee);
    });

    const request = httpTesting.expectOne('/api/employees');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush(employee);
  });

  it('should update an employee', () => {
    const payload: UpdateEmployeeRequest = {
      firstName: 'Maya',
      lastName: 'Sen',
      phone: '9999999999',
      jobTitle: 'Senior Frontend Developer',
      department: 'Engineering',
      hireDate: '2026-10-01',
    };

    service.updateEmployee(1, payload).subscribe((result) => {
      expect(result).toEqual(employee);
    });

    const request = httpTesting.expectOne('/api/employees/1');

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);

    request.flush(employee);
  });

  it('should update employee status', () => {
    const payload: UpdateEmployeeStatusRequest = {
      status: 'DISABLED',
    };

    service.updateEmployeeStatus(1, payload).subscribe();

    const request = httpTesting.expectOne(
      '/api/employees/1/status',
    );

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);

    request.flush(null);
  });
});
