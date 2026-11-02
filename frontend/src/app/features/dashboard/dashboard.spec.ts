
import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Auth } from '../../core/auth/auth';
import { Dashboard } from './dashboard';
import { EmployeeService } from '../employees/employee.service';
import { OrganizationService } from '../organization/organization.service';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  let currentRole: 'ORG_ADMIN' | 'EMPLOYEE';

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
    currentRole = 'ORG_ADMIN';

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
          useValue: {
            role: () => currentRole,
          },
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

  it('should load organization and employee data for an administrator', () => {
    expect(
      organizationService.getCurrentOrganization,
    ).toHaveBeenCalledTimes(1);

    expect(
      employeeService.getEmployees,
    ).toHaveBeenCalledTimes(1);

    expect(component.organization()).toEqual(organization);
    expect(component.employees()).toEqual(employees);
    expect(component.isLoading()).toBe(false);
    expect(component.loadError()).toBe('');
  });

  it('should render four dashboard statistics for an administrator', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const statCards = compiled.querySelectorAll('.stat-card');

    expect(statCards.length).toBe(4);
  });

  it('should render live employee statistics for an administrator', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Total Employees');
    expect(compiled.textContent).toContain('3');
    expect(compiled.textContent).toContain('Active Employees');
    expect(compiled.textContent).toContain('2');
    expect(compiled.textContent).toContain('Disabled Employees');
    expect(compiled.textContent).toContain('1');
    expect(compiled.textContent).toContain('Organization Status');
    expect(compiled.textContent).toContain('Active');
  });

  it('should render recent activities for an administrator', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const activityItems = compiled.querySelectorAll('.activity-item');

    expect(activityItems.length).toBe(3);
  });

  it('should render four quick actions for an administrator', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const quickActionButtons =
      compiled.querySelectorAll('.quick-actions button');

    expect(quickActionButtons.length).toBe(4);
  });

  it('should configure administrator actions with the correct routes', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const addEmployeeButton =
      compiled.querySelector('.dashboard-header .primary-button');

    expect(
      addEmployeeButton?.getAttribute('routerLink'),
    ).toBe('/employees');

    expect(
      component.quickActions().map((action) => action.route),
    ).toEqual([
      '/employees',
      '/tasks',
      '/onboarding',
      '/documents',
    ]);

    const actionButtons =
      compiled.querySelectorAll('.quick-actions button');

    expect(actionButtons.length).toBe(4);

    actionButtons.forEach((button, index) => {
      expect(button.textContent?.trim()).toBe(
        component.quickActions()[index].label,
      );
    });
  });

  it('should provide accessible names for dashboard sections', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const recentActivity = compiled.querySelector(
      'section[aria-labelledby="recent-activity-title"]',
    );

    const quickActions = compiled.querySelector(
      'section[aria-labelledby="quick-actions-title"]',
    );

    expect(recentActivity).toBeTruthy();
    expect(quickActions).toBeTruthy();

    expect(
      recentActivity
        ?.querySelector('#recent-activity-title')
        ?.textContent?.trim(),
    ).toBe('Recent Activity');

    expect(
      quickActions
        ?.querySelector('#quick-actions-title')
        ?.textContent?.trim(),
    ).toBe('Quick Actions');
  });

  it('should hide decorative activity icons from screen readers', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const icons = Array.from(
      compiled.querySelectorAll('.activity-icon'),
    );

    expect(icons.length).toBe(3);

    expect(
      icons.every(
        (icon) => icon.getAttribute('aria-hidden') === 'true',
      ),
    ).toBe(true);
  });

  it('should show an error when administrator employee loading fails', async () => {
    employeeService.getEmployees.mockReturnValueOnce(
      throwError(
        () => new HttpErrorResponse({ status: 503 }),
      ),
    );

    const errorFixture = TestBed.createComponent(Dashboard);
    const errorComponent = errorFixture.componentInstance;

    errorFixture.detectChanges();
    await errorFixture.whenStable();
    errorFixture.detectChanges();

    expect(errorComponent.isLoading()).toBe(false);
    expect(errorComponent.loadError()).toBe(
      'The server could not load dashboard data. Please try again.',
    );
  });

  it('should show an error when organization loading fails', async () => {
    organizationService.getCurrentOrganization.mockReturnValueOnce(
      throwError(
        () => new Error('Organization unavailable'),
      ),
    );

    const errorFixture = TestBed.createComponent(Dashboard);
    const errorComponent = errorFixture.componentInstance;

    errorFixture.detectChanges();
    await errorFixture.whenStable();
    errorFixture.detectChanges();

    expect(errorComponent.isLoading()).toBe(false);
    expect(errorComponent.loadError()).toBe(
      'Unable to load dashboard data. Please try again.',
    );
  });

  it('should not request the organization-wide employee directory for an employee', async () => {
    currentRole = 'EMPLOYEE';
    employeeService.getEmployees.mockClear();

    const employeeFixture = TestBed.createComponent(Dashboard);
    const employeeComponent = employeeFixture.componentInstance;

    employeeFixture.detectChanges();
    await employeeFixture.whenStable();
    employeeFixture.detectChanges();

    expect(
      organizationService.getCurrentOrganization,
    ).toHaveBeenCalled();

    expect(
      employeeService.getEmployees,
    ).not.toHaveBeenCalled();

    expect(employeeComponent.employees()).toEqual([]);
    expect(employeeComponent.isLoading()).toBe(false);
  });

  it('should show employee-specific statistics instead of organization-wide employee statistics', async () => {
    currentRole = 'EMPLOYEE';

    const employeeFixture = TestBed.createComponent(Dashboard);
    const employeeComponent = employeeFixture.componentInstance;

    employeeFixture.detectChanges();
    await employeeFixture.whenStable();
    employeeFixture.detectChanges();

    expect(employeeComponent.stats().length).toBe(2);

    expect(
      employeeComponent.stats().map((stat) => stat.label),
    ).toEqual([
      'Your Role',
      'Organization Status',
    ]);

    const compiled = employeeFixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Employee');
    expect(compiled.textContent).not.toContain('Total Employees');
    expect(compiled.textContent).not.toContain('Disabled Employees');
  });

  it('should hide Add Employee and Manage Employees from an employee', async () => {
    currentRole = 'EMPLOYEE';

    const employeeFixture = TestBed.createComponent(Dashboard);
    const employeeComponent = employeeFixture.componentInstance;

    employeeFixture.detectChanges();
    await employeeFixture.whenStable();
    employeeFixture.detectChanges();

    const compiled = employeeFixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector('.dashboard-header .primary-button'),
    ).toBeNull();

    expect(
      employeeComponent.quickActions().some(
        (action) => action.label === 'Manage Employees',
      ),
    ).toBe(false);

    expect(
      employeeComponent.quickActions().some(
        (action) => action.route === '/employees',
      ),
    ).toBe(false);

    expect(compiled.textContent).not.toContain('Manage Employees');
    expect(compiled.textContent).not.toContain('+ Add Employee');
  });

  it('should provide only employee workspace actions to an employee', async () => {
    currentRole = 'EMPLOYEE';

    const employeeFixture = TestBed.createComponent(Dashboard);
    const employeeComponent = employeeFixture.componentInstance;

    employeeFixture.detectChanges();
    await employeeFixture.whenStable();
    employeeFixture.detectChanges();

    expect(
      employeeComponent.quickActions().map((action) => action.label),
    ).toEqual([
      'View My Tasks',
      'View Documents',
      'Notifications',
    ]);

    expect(
      employeeComponent.quickActions().map((action) => action.route),
    ).toEqual([
      '/tasks',
      '/documents',
      '/notifications',
    ]);
  });
});
