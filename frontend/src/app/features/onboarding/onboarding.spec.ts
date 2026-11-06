
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { Onboarding } from './onboarding';
import {
  OnboardingResponse,
  OnboardingService,
} from './onboarding.service';
import {
  EmployeeResponse,
  EmployeeService,
} from '../employees/employee.service';

describe('Onboarding', () => {
  let component: Onboarding;
  let fixture: ComponentFixture<Onboarding>;

  let employeeService: {
    getEmployees: ReturnType<typeof vi.fn>;
  };

  let onboardingService: {
    getOnboardings: ReturnType<typeof vi.fn>;
    createOnboarding: ReturnType<typeof vi.fn>;
    updateOnboardingStatus: ReturnType<typeof vi.fn>;
    getOnboarding: ReturnType<typeof vi.fn>;
  };

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

  const secondEmployee: EmployeeResponse = {
    id: 2,
    userId: 11,
    firstName: 'Rahul',
    lastName: 'Das',
    email: 'rahul@example.com',
    phone: '9876543211',
    jobTitle: 'Developer',
    department: 'Engineering',
    hireDate: '2026-10-02',
    status: 'ACTIVE',
  };

  const disabledEmployee: EmployeeResponse = {
    ...employee,
    id: 3,
    userId: 12,
    email: 'disabled@example.com',
    status: 'DISABLED',
  };

  const onboarding: OnboardingResponse = {
    id: 100,
    employeeId: 1,
    employeeName: 'Maya Sen',
    employeeEmail: 'maya@example.com',
    status: 'NOT_STARTED',
    createdAt: '2026-10-01T10:00:00Z',
    completedAt: null,
  };

  beforeEach(async () => {
    employeeService = {
      getEmployees: vi.fn().mockReturnValue(
        of([employee, secondEmployee, disabledEmployee]),
      ),
    };

    onboardingService = {
      getOnboardings: vi.fn().mockReturnValue(
        of([onboarding]),
      ),
      createOnboarding: vi.fn(),
      updateOnboardingStatus: vi.fn(),
      getOnboarding: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Onboarding],
      providers: [
        {
          provide: EmployeeService,
          useValue: employeeService,
        },
        {
          provide: OnboardingService,
          useValue: onboardingService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Onboarding);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create the onboarding component', () => {
    expect(component).toBeTruthy();
  });

  it('should load employees from EmployeeService', () => {
    expect(employeeService.getEmployees).toHaveBeenCalled();

    expect(component.employees().length).toBe(3);
  });

  it('should load onboarding records from OnboardingService', () => {
    expect(onboardingService.getOnboardings).toHaveBeenCalled();

    expect(component.onboardings().length).toBe(1);

    expect(component.onboardings()[0].employeeName).toBe(
      'Maya Sen',
    );
  });

  it('should display actual onboarding records', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Maya Sen');
    expect(compiled.textContent).toContain('maya@example.com');
    expect(compiled.textContent).toContain('Engineering');
    expect(compiled.textContent).toContain('Not Started');
  });

  it('should filter onboarding records by employee name', () => {
    component.updateSearch('Maya');

    expect(component.filteredOnboarding().length).toBe(1);

    expect(component.filteredOnboarding()[0].employeeName).toBe(
      'Maya Sen',
    );
  });

  it('should filter onboarding records by employee email', () => {
    component.updateSearch('maya@example.com');

    expect(component.filteredOnboarding().length).toBe(1);
  });

  it('should filter onboarding records by status', () => {
    component.updateStatus('COMPLETED');

    expect(component.filteredOnboarding().length).toBe(0);

    component.updateStatus('NOT_STARTED');

    expect(component.filteredOnboarding().length).toBe(1);
  });

  it('should show only active employees without existing onboarding', () => {
    expect(component.availableEmployees().length).toBe(1);

    expect(component.availableEmployees()[0].id).toBe(2);
  });

  it('should open the start onboarding form', () => {
    component.openStartOnboarding();
    fixture.detectChanges();

    expect(component.isStartOnboardingOpen()).toBe(true);

    const form = fixture.nativeElement.querySelector(
      '.start-onboarding-card',
    );

    expect(form).toBeTruthy();
  });

  it('should close the start onboarding form', () => {
    component.openStartOnboarding();
    fixture.detectChanges();

    component.closeStartOnboarding();
    fixture.detectChanges();

    expect(component.isStartOnboardingOpen()).toBe(false);

    const form = fixture.nativeElement.querySelector(
      '.start-onboarding-card',
    );

    expect(form).toBeNull();
  });

  it('should validate an empty onboarding form', () => {
    component.openStartOnboarding();

    component.saveOnboarding();

    expect(component.startOnboardingSubmitted()).toBe(true);

    expect(
      component.startOnboardingForm.controls.employeeId.touched,
    ).toBe(true);

    expect(component.startOnboardingForm.invalid).toBe(true);

    expect(
      onboardingService.createOnboarding,
    ).not.toHaveBeenCalled();
  });

  it('should create onboarding using the selected employee ID', () => {
    const createdOnboarding: OnboardingResponse = {
      id: 101,
      employeeId: 2,
      employeeName: 'Rahul Das',
      employeeEmail: 'rahul@example.com',
      status: 'NOT_STARTED',
      createdAt: '2026-10-15T10:00:00Z',
      completedAt: null,
    };

    onboardingService.createOnboarding.mockReturnValue(
      of(createdOnboarding),
    );

    component.openStartOnboarding();

    component.startOnboardingForm.controls.employeeId.setValue(2);

    component.saveOnboarding();

    expect(
      onboardingService.createOnboarding,
    ).toHaveBeenCalledWith({
      employeeId: 2,
    });

    expect(component.onboardings().length).toBe(2);

    expect(component.onboardings()[0].employeeName).toBe(
      'Rahul Das',
    );

    expect(component.isStartOnboardingOpen()).toBe(false);

    expect(component.successMessage()).toContain(
      'created successfully',
    );
  });

  it('should update onboarding status through the API', () => {
    const updatedOnboarding: OnboardingResponse = {
      ...onboarding,
      status: 'IN_PROGRESS',
    };

    onboardingService.updateOnboardingStatus.mockReturnValue(
      of(updatedOnboarding),
    );

    const event = {
      target: {
        value: 'IN_PROGRESS',
      },
    } as unknown as Event;

    component.onStatusChange(onboarding, event);

    expect(
      onboardingService.updateOnboardingStatus,
    ).toHaveBeenCalledWith(
      onboarding.id,
      {
        status: 'IN_PROGRESS',
      },
    );

    expect(component.onboardings()[0].status).toBe(
      'IN_PROGRESS',
    );
  });

  it('should not update status when selected status is unchanged', () => {
    const event = {
      target: {
        value: 'NOT_STARTED',
      },
    } as unknown as Event;

    component.onStatusChange(onboarding, event);

    expect(
      onboardingService.updateOnboardingStatus,
    ).not.toHaveBeenCalled();
  });

  it('should display the onboarding tracker heading', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector('#onboarding-tracker-title')
        ?.textContent?.trim(),
    ).toBe('Onboarding Tracker');
  });

  it('should use the actual backend status labels', () => {
    expect(component.getStatusLabel('NOT_STARTED')).toBe(
      'Not Started',
    );

    expect(component.getStatusLabel('IN_PROGRESS')).toBe(
      'In Progress',
    );

    expect(component.getStatusLabel('COMPLETED')).toBe(
      'Completed',
    );
  });
});
