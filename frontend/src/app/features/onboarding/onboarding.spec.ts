import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { Onboarding } from './onboarding';
import { OnboardingService } from './onboarding.service';
import { EmployeeService } from '../employees/employee.service';

describe('Onboarding', () => {
  let component: Onboarding;
  let fixture: ComponentFixture<Onboarding>;

  const employee = {
    id: 1,
    userId: 10,
    firstName: 'Maya',
    lastName: 'Sen',
    email: 'maya@example.com',
    phone: null,
    jobTitle: 'Developer',
    department: 'Engineering',
    hireDate: '2026-10-13',
    status: 'ACTIVE' as const,
  };

  const onboarding = {
    id: 1,
    employeeId: 1,
    employeeName: 'Maya Sen',
    employeeEmail: 'maya@example.com',
    status: 'NOT_STARTED' as const,
    createdAt: '2026-10-13T10:00:00Z',
    completedAt: null,
  };

  const employeeService = {
    getEmployees: vi.fn(),
  };

  const onboardingService = {
    getOnboardings: vi.fn(),
    getOnboarding: vi.fn(),
    createOnboarding: vi.fn(),
    updateOnboardingStatus: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    employeeService.getEmployees.mockReturnValue(of([employee]));
    onboardingService.getOnboardings.mockReturnValue(of([onboarding]));
    onboardingService.getOnboarding.mockReturnValue(of(onboarding));
    onboardingService.createOnboarding.mockReturnValue(
      of({
        ...onboarding,
        id: 2,
      }),
    );
    onboardingService.updateOnboardingStatus.mockReturnValue(
      of({
        ...onboarding,
        status: 'COMPLETED',
        completedAt: '2026-10-14T10:00:00Z',
      }),
    );

    await TestBed.configureTestingModule({
      imports: [Onboarding],
      providers: [
        { provide: EmployeeService, useValue: employeeService },
        { provide: OnboardingService, useValue: onboardingService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Onboarding);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load active employees and onboarding records', () => {
    expect(employeeService.getEmployees).toHaveBeenCalled();
    expect(onboardingService.getOnboardings).toHaveBeenCalled();

    expect(component.employees().length).toBe(1);
    expect(component.onboardings().length).toBe(1);
  });

  it('should display onboarding records in the table', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const rows = compiled.querySelectorAll('tbody tr');

    expect(rows.length).toBe(1);
    expect(compiled.textContent).toContain('Maya Sen');
  });

  it('should filter onboarding records by employee name', () => {
    component.updateSearch('Maya');

    expect(component.filteredOnboarding().length).toBe(1);
    expect(component.filteredOnboarding()[0].employee).toBe('Maya Sen');
  });

  it('should filter onboarding records by status', () => {
    component.updateStatus('NOT_STARTED');

    expect(component.filteredOnboarding().length).toBe(1);

    component.updateStatus('COMPLETED');

    expect(component.filteredOnboarding().length).toBe(0);
  });

  it('should label the onboarding tracker table accessibly', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const table = compiled.querySelector('table');
    const heading = compiled.querySelector('#onboarding-tracker-title');

    expect(heading?.textContent?.trim()).toBe('Onboarding Tracker');

    expect(table?.getAttribute('aria-labelledby')).toBe('onboarding-tracker-title');
  });

  it('should mark onboarding table headers as column headers', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const headers = Array.from(compiled.querySelectorAll('thead th'));

    expect(headers.length).toBe(6);

    expect(headers.every((header) => header.getAttribute('scope') === 'col')).toBe(true);
  });

  it('should open the start onboarding form', () => {
    expect(component.isStartOnboardingOpen()).toBe(false);

    component.openStartOnboarding();
    fixture.detectChanges();

    expect(component.isStartOnboardingOpen()).toBe(true);

    const form = fixture.nativeElement.querySelector('.start-onboarding-card');

    expect(form).toBeTruthy();
  });

  it('should close the start onboarding form', () => {
    component.openStartOnboarding();
    fixture.detectChanges();

    expect(component.isStartOnboardingOpen()).toBe(true);

    component.closeStartOnboarding();
    fixture.detectChanges();

    expect(component.isStartOnboardingOpen()).toBe(false);

    const form = fixture.nativeElement.querySelector('.start-onboarding-card');

    expect(form).toBeNull();
  });

  it('should validate employee selection when saving an empty form', () => {
    component.openStartOnboarding();

    component.saveOnboarding();

    expect(component.startOnboardingSubmitted()).toBe(true);
    expect(component.startOnboardingForm.controls.employeeId.touched).toBe(true);

    expect(onboardingService.createOnboarding).not.toHaveBeenCalled();
  });

  it('should create onboarding using the selected employee ID', () => {
    component.openStartOnboarding();

    component.startOnboardingForm.setValue({
      employeeId: 1,
    });

    component.onEmployeeSelected(1);

    expect(component.startOnboardingForm.valid).toBe(true);

    component.saveOnboarding();

    expect(onboardingService.createOnboarding).toHaveBeenCalledWith({
      employeeId: 1,
    });

    expect(component.isStartOnboardingOpen()).toBe(false);
    expect(component.onboardings().length).toBe(2);
    expect(component.onboardings()[1].employee).toBe('Maya Sen');
    expect(component.onboardings()[1].department).toBe('Engineering');
    expect(component.onboardings()[1].startDate).toBe('2026-10-13');
    expect(component.onboardings()[1].status).toBe('NOT_STARTED');
  });

  it('should update onboarding status through the API service', () => {
    component.updateOnboardingRecordStatus(1, 'COMPLETED');

    expect(onboardingService.updateOnboardingStatus).toHaveBeenCalledWith(1, {
      status: 'COMPLETED',
    });

    expect(component.onboardings()[0].status).toBe('COMPLETED');
  });

  it('should ignore an invalid onboarding status', () => {
    component.updateOnboardingRecordStatus(1, 'INVALID');

    expect(onboardingService.updateOnboardingStatus).not.toHaveBeenCalled();
  });

  it('should display an error when employee loading fails', () => {
    employeeService.getEmployees.mockReturnValue(throwError(() => new Error('Server error')));

    component.loadData();

    expect(component.errorMessage()).toBe('Unable to load employees. Please try again.');
  });

  it('should display an error when onboarding loading fails', () => {
    onboardingService.getOnboardings.mockReturnValue(throwError(() => new Error('Server error')));

    component.loadData();

    expect(component.errorMessage()).toBe('Unable to load onboarding records. Please try again.');
  });
});
