import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { Auth } from '../../core/auth/auth';
import { Dashboard } from './dashboard';
import { EmployeeService } from '../employees/employee.service';
import { OrganizationService } from '../organization/organization.service';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  let auth: {
    isOrgAdmin: ReturnType<typeof vi.fn>;
  };

  let organizationService: {
    getCurrentOrganization: ReturnType<typeof vi.fn>;
    updateCurrentOrganization: ReturnType<typeof vi.fn>;
  };

  let employeeService: {
    getEmployees: ReturnType<typeof vi.fn>;
    getEmployee: ReturnType<typeof vi.fn>;
    createEmployee: ReturnType<typeof vi.fn>;
    updateEmployee: ReturnType<typeof vi.fn>;
    updateEmployeeStatus: ReturnType<typeof vi.fn>;
  };

  const organization = {
    id: 1,
    name: 'WorkSphere Demo',
    status: 'ACTIVE' as const,
    createdAt: '2026-10-01T10:00:00Z',
  };

  const employees = [
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
      status: 'ACTIVE' as const,
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
      status: 'ACTIVE' as const,
    },
    {
      id: 3,
      userId: 103,
      firstName: 'Sneha',
      lastName: 'Patel',
      email: 'sneha@example.com',
      phone: null,
      jobTitle: 'Operations Executive',
      department: 'Operations',
      hireDate: '2026-03-10',
      status: 'DISABLED' as const,
    },
  ];

  beforeEach(async () => {
    auth = {
      isOrgAdmin: vi.fn().mockReturnValue(true),
    };

    organizationService = {
      getCurrentOrganization: vi.fn().mockReturnValue(
        of(organization),
      ),
      updateCurrentOrganization: vi.fn(),
    };

    employeeService = {
      getEmployees: vi.fn().mockReturnValue(
        of(employees),
      ),
      getEmployee: vi.fn(),
      createEmployee: vi.fn(),
      updateEmployee: vi.fn(),
      updateEmployeeStatus: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        {
          provide: Auth,
          useValue: auth,
        },
        {
          provide: OrganizationService,
          useValue: organizationService,
        },
        {
          provide: EmployeeService,
          useValue: employeeService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load organization and employee data for an organization admin', () => {
    expect(
      organizationService.getCurrentOrganization,
    ).toHaveBeenCalledTimes(1);

    expect(
      employeeService.getEmployees,
    ).toHaveBeenCalledTimes(1);

    expect(component.organization()).toEqual(
      organization,
    );

    expect(component.employees()).toEqual(
      employees,
    );

    expect(component.isLoading()).toBe(false);
    expect(component.loadError()).toBe('');
  });

  it('should load organization data without employee data for an employee', async () => {
    auth.isOrgAdmin.mockReturnValue(false);

    employeeService.getEmployees.mockClear();

    const employeeFixture =
      TestBed.createComponent(Dashboard);

    const employeeComponent =
      employeeFixture.componentInstance;

    employeeFixture.detectChanges();
    await employeeFixture.whenStable();
    employeeFixture.detectChanges();

    expect(
      employeeService.getEmployees,
    ).not.toHaveBeenCalled();

    expect(
      employeeComponent.organization(),
    ).toEqual(organization);

    expect(
      employeeComponent.employees(),
    ).toEqual([]);

    expect(
      employeeComponent.isLoading(),
    ).toBe(false);
  });

  it('should render four statistics for an organization admin', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const statCards =
      compiled.querySelectorAll('.stat-card');

    expect(statCards.length).toBe(4);
  });

  it('should render two workspace statistics for an employee', async () => {
    auth.isOrgAdmin.mockReturnValue(false);

    const employeeFixture =
      TestBed.createComponent(Dashboard);

    employeeFixture.detectChanges();
    await employeeFixture.whenStable();
    employeeFixture.detectChanges();

    const compiled =
      employeeFixture.nativeElement as HTMLElement;

    const statCards =
      compiled.querySelectorAll('.stat-card');

    expect(statCards.length).toBe(2);

    expect(compiled.textContent).toContain(
      'WorkSphere Demo',
    );

    expect(compiled.textContent).toContain(
      'Organization Status',
    );
  });

  it('should render live employee statistics for an organization admin', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.textContent,
    ).toContain('Total Employees');

    expect(
      compiled.textContent,
    ).toContain('3');

    expect(
      compiled.textContent,
    ).toContain('Active Employees');

    expect(
      compiled.textContent,
    ).toContain('2');

    expect(
      compiled.textContent,
    ).toContain('Disabled Employees');

    expect(
      compiled.textContent,
    ).toContain('1');

    expect(
      compiled.textContent,
    ).toContain('Organization Status');

    expect(
      compiled.textContent,
    ).toContain('Active');
  });

  it('should render recent activities for an organization admin', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const activityItems =
      compiled.querySelectorAll('.activity-item');

    expect(activityItems.length).toBe(3);
  });

  it('should render workspace activities for an employee', async () => {
    auth.isOrgAdmin.mockReturnValue(false);

    const employeeFixture =
      TestBed.createComponent(Dashboard);

    employeeFixture.detectChanges();
    await employeeFixture.whenStable();
    employeeFixture.detectChanges();

    const compiled =
      employeeFixture.nativeElement as HTMLElement;

    const activityItems =
      compiled.querySelectorAll('.activity-item');

    expect(activityItems.length).toBe(3);

    expect(
      compiled.textContent,
    ).toContain('Workspace ready');
  });

  it('should render administrator quick actions', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const quickActionButtons =
      compiled.querySelectorAll(
        '.quick-actions button',
      );

    expect(
      quickActionButtons.length,
    ).toBe(4);

    expect(
      compiled.textContent,
    ).toContain('Manage Employees');
  });

  it('should render employee quick actions without admin actions', async () => {
    auth.isOrgAdmin.mockReturnValue(false);

    const employeeFixture =
      TestBed.createComponent(Dashboard);

    employeeFixture.detectChanges();
    await employeeFixture.whenStable();
    employeeFixture.detectChanges();

    const compiled =
      employeeFixture.nativeElement as HTMLElement;

    const quickActionButtons =
      compiled.querySelectorAll(
        '.quick-actions button',
      );

    expect(
      quickActionButtons.length,
    ).toBe(4);

    expect(
      compiled.textContent,
    ).not.toContain('Manage Employees');

    expect(
      compiled.textContent,
    ).toContain('View Tasks');

    expect(
      compiled.textContent,
    ).toContain('Review Onboarding');

    expect(
      compiled.textContent,
    ).toContain('View Documents');

    expect(
      compiled.textContent,
    ).toContain('View Notifications');
  });

  it('should show add employee only for organization admins', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector(
        '.primary-button',
      ),
    ).toBeTruthy();
  });

  it('should hide add employee for employees', async () => {
    auth.isOrgAdmin.mockReturnValue(false);

    const employeeFixture =
      TestBed.createComponent(Dashboard);

    employeeFixture.detectChanges();
    await employeeFixture.whenStable();
    employeeFixture.detectChanges();

    const compiled =
      employeeFixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector(
        '.primary-button',
      ),
    ).toBeNull();
  });

  it('should configure administrator dashboard actions with the correct routes', () => {
    expect(
      component.quickActions().map(
        (action) => action.route,
      ),
    ).toEqual([
      '/employees',
      '/tasks',
      '/onboarding',
      '/documents',
    ]);
  });

  it('should handle employee access being unavailable for an organization admin', async () => {
    employeeService.getEmployees.mockReturnValueOnce(
      throwError(
        () =>
          new Error(
            'Forbidden',
          ),
      ),
    );

    const errorFixture =
      TestBed.createComponent(Dashboard);

    const errorComponent =
      errorFixture.componentInstance;

    errorFixture.detectChanges();
    await errorFixture.whenStable();
    errorFixture.detectChanges();

    expect(
      errorComponent.isLoading(),
    ).toBe(false);
  });

  it('should show an error when organization loading fails', async () => {
    organizationService.getCurrentOrganization.mockReturnValueOnce(
      throwError(
        () =>
          new Error(
            'Organization unavailable',
          ),
      ),
    );

    const errorFixture =
      TestBed.createComponent(Dashboard);

    const errorComponent =
      errorFixture.componentInstance;

    errorFixture.detectChanges();
    await errorFixture.whenStable();
    errorFixture.detectChanges();

    expect(
      errorComponent.isLoading(),
    ).toBe(false);

    expect(
      errorComponent.loadError(),
    ).toBe(
      'Unable to load dashboard data. Please try again.',
    );
  });
});