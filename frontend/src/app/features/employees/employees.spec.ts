import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { Employees } from './employees';
import {
  CreateEmployeeRequest,
  EmployeeResponse,
  EmployeeService,
} from './employee.service';

describe('Employees', () => {
  let component: Employees;
  let fixture: ComponentFixture<Employees>;
  let employeeService: {
    getEmployees: ReturnType<typeof vi.fn>;
    createEmployee: ReturnType<typeof vi.fn>;
    getEmployee: ReturnType<typeof vi.fn>;
    updateEmployee: ReturnType<typeof vi.fn>;
    updateEmployeeStatus: ReturnType<typeof vi.fn>;
  };

  const demoEmployees: EmployeeResponse[] = [
    {
      id: 1,
      userId: 101,
      firstName: 'Aarav',
      lastName: 'Sharma',
      email: 'aarav@example.com',
      phone: null,
      jobTitle: 'Software Engineer',
      department: 'Engineering',
      hireDate: '2026-01-10',
      status: 'ACTIVE',
    },
    {
      id: 2,
      userId: 102,
      firstName: 'Priya',
      lastName: 'Das',
      email: 'priya@example.com',
      phone: null,
      jobTitle: 'HR Manager',
      department: 'Human Resources',
      hireDate: '2026-02-10',
      status: 'ACTIVE',
    },
    {
      id: 3,
      userId: 103,
      firstName: 'Rahul',
      lastName: 'Verma',
      email: 'rahul@example.com',
      phone: null,
      jobTitle: 'Financial Analyst',
      department: 'Finance',
      hireDate: '2026-03-10',
      status: 'ACTIVE',
    },
    {
      id: 4,
      userId: 104,
      firstName: 'Sneha',
      lastName: 'Patel',
      email: 'sneha@example.com',
      phone: null,
      jobTitle: 'Operations Executive',
      department: 'Operations',
      hireDate: '2026-04-10',
      status: 'DISABLED',
    },
    {
      id: 5,
      userId: 105,
      firstName: 'Aditya',
      lastName: 'Singh',
      email: 'aditya@example.com',
      phone: null,
      jobTitle: 'QA Engineer',
      department: 'Engineering',
      hireDate: '2026-05-10',
      status: 'ACTIVE',
    },
    {
      id: 6,
      userId: 106,
      firstName: 'Neha',
      lastName: 'Roy',
      email: 'neha@example.com',
      phone: null,
      jobTitle: 'Marketing Specialist',
      department: 'Marketing',
      hireDate: '2026-06-10',
      status: 'ACTIVE',
    },
  ];

  beforeEach(async () => {
    employeeService = {
      getEmployees: vi.fn().mockReturnValue(of(demoEmployees)),
      createEmployee: vi.fn(),
      getEmployee: vi.fn(),
      updateEmployee: vi.fn(),
      updateEmployeeStatus: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Employees],
      providers: [
        {
          provide: EmployeeService,
          useValue: employeeService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Employees);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load employees from the service', () => {
    expect(employeeService.getEmployees).toHaveBeenCalledTimes(1);
    expect(component.employees()).toEqual(demoEmployees);
    expect(component.isLoading()).toBe(false);
  });

  it('should render employee rows', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const rows = compiled.querySelectorAll('tbody tr');

    expect(rows.length).toBe(6);
  });

  it('should filter employees by search term', () => {
    component.updateSearch('Priya');

    expect(component.filteredEmployees().length).toBe(1);
    expect(component.filteredEmployees()[0].firstName).toBe('Priya');
    expect(component.filteredEmployees()[0].lastName).toBe('Das');
  });

  it('should filter employees by status', () => {
    component.updateStatus('Inactive');

    expect(component.filteredEmployees().length).toBe(1);
    expect(component.filteredEmployees()[0].firstName).toBe('Sneha');
    expect(component.filteredEmployees()[0].lastName).toBe('Patel');
  });

  it('should search employees case-insensitively', () => {
    component.updateSearch('priya');

    expect(component.filteredEmployees().length).toBe(1);
    expect(component.filteredEmployees()[0].firstName).toBe('Priya');
    expect(component.filteredEmployees()[0].lastName).toBe('Das');
  });

  it('should return all employees when status is All', () => {
    component.updateStatus('All');

    expect(component.filteredEmployees().length).toBe(6);
  });

  it('should label the employee directory table', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const table = compiled.querySelector('table');
    const heading = compiled.querySelector(
      '#employee-directory-title',
    );

    expect(heading?.textContent?.trim()).toBe(
      'Employee Directory',
    );

    expect(
      table?.getAttribute('aria-labelledby'),
    ).toBe('employee-directory-title');
  });

  it('should mark employee table headers as column headers', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const headers = Array.from(
      compiled.querySelectorAll('thead th'),
    );

    expect(headers.length).toBe(4);
    expect(
      headers.every(
        (header) => header.getAttribute('scope') === 'col',
      ),
    ).toBe(true);
  });

  it('should hide employee avatar initials from screen readers', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const avatars = Array.from(
      compiled.querySelectorAll('.employee-avatar'),
    );

    expect(avatars.length).toBe(6);
    expect(
      avatars.every(
        (avatar) => avatar.getAttribute('aria-hidden') === 'true',
      ),
    ).toBe(true);
  });

  it('should open the add employee form', () => {
    expect(component.isAddEmployeeOpen()).toBe(false);

    component.openAddEmployee();
    fixture.detectChanges();

    expect(component.isAddEmployeeOpen()).toBe(true);

    const form = fixture.nativeElement.querySelector(
      '.add-employee-card',
    );

    expect(form).toBeTruthy();
  });

  it('should close the add employee form', () => {
    component.openAddEmployee();
    fixture.detectChanges();

    expect(component.isAddEmployeeOpen()).toBe(true);

    component.closeAddEmployee();
    fixture.detectChanges();

    expect(component.isAddEmployeeOpen()).toBe(false);

    const form = fixture.nativeElement.querySelector(
      '.add-employee-card',
    );

    expect(form).toBeNull();
  });

  it('should open the edit employee form with the selected employee data', () => {
    const employee = demoEmployees[0];

    component.openEditEmployee(employee);
    fixture.detectChanges();

    expect(component.isEditEmployeeOpen()).toBe(true);
    expect(component.editingEmployeeId()).toBe(employee.id);

    expect(
      component.editEmployeeForm.controls.firstName.value,
    ).toBe(employee.firstName);

    expect(
      component.editEmployeeForm.controls.lastName.value,
    ).toBe(employee.lastName);

    expect(
      component.editEmployeeForm.controls.phone.value,
    ).toBe(employee.phone ?? '');

    expect(
      component.editEmployeeForm.controls.department.value,
    ).toBe(employee.department ?? '');

    expect(
      component.editEmployeeForm.controls.role.value,
    ).toBe(employee.jobTitle ?? '');

    expect(
      component.editEmployeeForm.controls.hireDate.value,
    ).toBe(employee.hireDate ?? '');
  });

  it('should update an employee through the service', () => {
    const employee = demoEmployees[0];

    const updatedEmployee: EmployeeResponse = {
      ...employee,
      firstName: 'Aarav Updated',
      lastName: 'Sharma Updated',
      phone: '9999999999',
      jobTitle: 'Senior Software Engineer',
      department: 'Engineering',
      hireDate: '2026-10-15',
    };

    employeeService.updateEmployee.mockReturnValue(
      of(updatedEmployee),
    );

    component.openEditEmployee(employee);

    component.editEmployeeForm.setValue({
      firstName: ' Aarav Updated ',
      lastName: ' Sharma Updated ',
      phone: '9999999999',
      department: 'Engineering',
      role: 'Senior Software Engineer',
      hireDate: '2026-10-15',
    });

    component.updateEmployee();
    fixture.detectChanges();

    expect(employeeService.updateEmployee).toHaveBeenCalledWith(
      employee.id,
      {
        firstName: 'Aarav Updated',
        lastName: 'Sharma Updated',
        phone: '9999999999',
        jobTitle: 'Senior Software Engineer',
        department: 'Engineering',
        hireDate: '2026-10-15',
      },
    );

    expect(component.isEditEmployeeOpen()).toBe(false);
    expect(component.editingEmployeeId()).toBeNull();

    expect(component.employees()[0]).toEqual(updatedEmployee);
  });

  it('should show an error when employee update fails', () => {
    const employee = demoEmployees[0];

    employeeService.updateEmployee.mockReturnValue(
      throwError(() => new Error('Update failed')),
    );

    component.openEditEmployee(employee);

    component.editEmployeeForm.setValue({
      firstName: 'Updated',
      lastName: 'Employee',
      phone: '',
      department: '',
      role: '',
      hireDate: '',
    });

    component.updateEmployee();
    fixture.detectChanges();

    expect(component.isUpdating()).toBe(false);

    expect(component.updateError()).toBe(
      'Unable to complete the employee request. Please try again.',
    );

    expect(component.isEditEmployeeOpen()).toBe(true);
  });

  it('should validate all required add employee fields when saving an empty form', () => {
    component.openAddEmployee();
    fixture.detectChanges();

    component.saveEmployee();
    fixture.detectChanges();

    expect(component.addEmployeeSubmitted()).toBe(true);

    expect(
      component.addEmployeeForm.controls.firstName.touched,
    ).toBe(true);

    expect(
      component.addEmployeeForm.controls.lastName.touched,
    ).toBe(true);

    expect(
      component.addEmployeeForm.controls.email.touched,
    ).toBe(true);

    expect(
      component.addEmployeeForm.controls.password.touched,
    ).toBe(true);

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(
      'First name is required.',
    );

    expect(compiled.textContent).toContain(
      'Last name is required.',
    );

    expect(compiled.textContent).toContain(
      'Email address is required.',
    );

    expect(compiled.textContent).toContain(
      'Password is required.',
    );

    expect(employeeService.createEmployee).not.toHaveBeenCalled();
  });

  it('should reject a password shorter than 12 characters', () => {
    component.addEmployeeForm.controls.password.setValue(
      'Short123',
    );

    expect(
      component.addEmployeeForm.controls.password.hasError(
        'minPasswordLength',
      ),
    ).toBe(true);

    expect(
      component.addEmployeeForm.controls.password.valid,
    ).toBe(false);
  });

  it('should reject a password above 72 UTF-8 bytes', () => {
    const longUtf8Password = '😀'.repeat(19);

    component.addEmployeeForm.controls.password.setValue(
      longUtf8Password,
    );

    expect(
      new TextEncoder().encode(longUtf8Password).length,
    ).toBe(76);

    expect(
      component.addEmployeeForm.controls.password.hasError(
        'maxPasswordBytes',
      ),
    ).toBe(true);

    expect(
      component.addEmployeeForm.controls.password.valid,
    ).toBe(false);
  });

  it('should create a valid employee through the service', () => {
    const createdEmployee: EmployeeResponse = {
      id: 7,
      userId: 107,
      firstName: 'Maya',
      lastName: 'Sen',
      email: 'maya@example.com',
      phone: '9876543210',
      jobTitle: 'Frontend Developer',
      department: 'Engineering',
      hireDate: '2026-10-20',
      status: 'ACTIVE',
    };

    employeeService.createEmployee.mockReturnValue(
      of(createdEmployee),
    );

    component.openAddEmployee();
    fixture.detectChanges();

    component.addEmployeeForm.setValue({
      firstName: ' Maya ',
      lastName: ' Sen ',
      email: 'Maya@Example.com',
      password: 'ValidPassword123',
      phone: '9876543210',
      department: 'Engineering',
      role: 'Frontend Developer',
      hireDate: '2026-10-20',
    });

    expect(component.addEmployeeForm.valid).toBe(true);

    component.saveEmployee();
    fixture.detectChanges();

    const expectedRequest: CreateEmployeeRequest = {
      firstName: 'Maya',
      lastName: 'Sen',
      email: 'maya@example.com',
      password: 'ValidPassword123',
      phone: '9876543210',
      jobTitle: 'Frontend Developer',
      department: 'Engineering',
      hireDate: '2026-10-20',
    };

    expect(employeeService.createEmployee).toHaveBeenCalledWith(
      expectedRequest,
    );

    expect(component.isAddEmployeeOpen()).toBe(false);
    expect(component.filteredEmployees().length).toBe(7);

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Maya Sen');
    expect(compiled.textContent).toContain('maya@example.com');
    expect(compiled.textContent).toContain(
      'Frontend Developer',
    );

    expect(
      component.addEmployeeForm.controls.firstName.value,
    ).toBe('');

    expect(
      component.addEmployeeForm.controls.lastName.value,
    ).toBe('');

    expect(
      component.addEmployeeForm.controls.email.value,
    ).toBe('');

    expect(
      component.addEmployeeForm.controls.password.value,
    ).toBe('');
  });

  it('should show a load error when employee loading fails', () => {
    employeeService.getEmployees.mockReturnValueOnce(
      throwError(() => new Error('Load failed')),
    );

    const errorFixture = TestBed.createComponent(Employees);
    const errorComponent = errorFixture.componentInstance;

    errorFixture.detectChanges();

    expect(errorComponent.isLoading()).toBe(false);
    expect(errorComponent.loadError()).toBe(
      'Unable to complete the employee request. Please try again.',
    );
  });
});
