import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Onboarding } from './onboarding';

describe('Onboarding', () => {
  let component: Onboarding;
  let fixture: ComponentFixture<Onboarding>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Onboarding],
    }).compileComponents();

    fixture = TestBed.createComponent(Onboarding);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render onboarding records', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const rows = compiled.querySelectorAll('tbody tr');

    expect(rows.length).toBe(4);
  });

  it('should filter onboarding records by employee name', () => {
    component.updateSearch('Priya');

    expect(component.filteredOnboarding().length).toBe(1);
    expect(component.filteredOnboarding()[0].employee).toBe(
      'Priya Das',
    );
  });

  it('should filter onboarding records by status', () => {
    component.updateStatus('Completed');

    expect(component.filteredOnboarding().length).toBe(1);
    expect(component.filteredOnboarding()[0].employee).toBe(
      'Aarav Sharma',
    );
  });

  it('should label the onboarding tracker table', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const table = compiled.querySelector('table');
    const heading = compiled.querySelector(
      '#onboarding-tracker-title',
    );

    expect(heading?.textContent?.trim()).toBe(
      'Onboarding Tracker',
    );

    expect(
      table?.getAttribute('aria-labelledby'),
    ).toBe('onboarding-tracker-title');
  });

  it('should mark onboarding table headers as column headers', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const headers = Array.from(
      compiled.querySelectorAll('thead th'),
    );

    expect(headers.length).toBe(5);

    expect(
      headers.every(
        (header) => header.getAttribute('scope') === 'col',
      ),
    ).toBe(true);
  });

  it('should expose onboarding progress accessibly', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const progressBars = Array.from(
      compiled.querySelectorAll(
        '.progress-bar[role="progressbar"]',
      ),
    );

    expect(progressBars.length).toBe(4);

    expect(
      progressBars.every(
        (progressBar) =>
          progressBar.getAttribute('aria-valuemin') === '0' &&
          progressBar.getAttribute('aria-valuemax') === '100' &&
          progressBar.hasAttribute('aria-valuenow'),
      ),
    ).toBe(true);

    expect(
      progressBars[0]?.getAttribute('aria-label'),
    ).toContain('onboarding progress');
  });

  it('should open the start onboarding form', () => {
    expect(
      component.isStartOnboardingOpen(),
    ).toBe(false);

    component.openStartOnboarding();
    fixture.detectChanges();

    expect(
      component.isStartOnboardingOpen(),
    ).toBe(true);

    const form = fixture.nativeElement.querySelector(
      '.start-onboarding-card',
    );

    expect(form).toBeTruthy();
  });

  it('should close the start onboarding form', () => {
    component.openStartOnboarding();
    fixture.detectChanges();

    expect(
      component.isStartOnboardingOpen(),
    ).toBe(true);

    component.closeStartOnboarding();
    fixture.detectChanges();

    expect(
      component.isStartOnboardingOpen(),
    ).toBe(false);

    const form = fixture.nativeElement.querySelector(
      '.start-onboarding-card',
    );

    expect(form).toBeNull();
  });

  it('should validate all start onboarding fields when saving an empty form', () => {
    component.openStartOnboarding();
    fixture.detectChanges();

    component.saveOnboarding();
    fixture.detectChanges();

    expect(
      component.startOnboardingSubmitted(),
    ).toBe(true);

    expect(
      component.startOnboardingForm.controls.employee.touched,
    ).toBe(true);

    expect(
      component.startOnboardingForm.controls.department.touched,
    ).toBe(true);

    expect(
      component.startOnboardingForm.controls.startDate.touched,
    ).toBe(true);

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(
      'Employee name is required.',
    );

    expect(compiled.textContent).toContain(
      'Department is required.',
    );

    expect(compiled.textContent).toContain(
      'Start date is required.',
    );
  });

  it('should add a valid onboarding record', () => {
    component.openStartOnboarding();
    fixture.detectChanges();

    component.startOnboardingForm.setValue({
      employee: 'Maya Sen',
      department: 'Engineering',
      startDate: '2026-10-13',
    });

    expect(
      component.startOnboardingForm.valid,
    ).toBe(true);

    component.saveOnboarding();
    fixture.detectChanges();

    expect(
      component.isStartOnboardingOpen(),
    ).toBe(false);

    expect(
      component.filteredOnboarding().length,
    ).toBe(5);

    expect(
      component.filteredOnboarding()[4].employee,
    ).toBe('Maya Sen');

    expect(
      component.filteredOnboarding()[4].department,
    ).toBe('Engineering');

    expect(
      component.filteredOnboarding()[4].startDate,
    ).toBe('2026-10-13');

    expect(
      component.filteredOnboarding()[4].progress,
    ).toBe(0);

    expect(
      component.filteredOnboarding()[4].status,
    ).toBe('Not Started');

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(
      'Maya Sen',
    );

    expect(compiled.textContent).toContain(
      'Engineering',
    );

    expect(compiled.textContent).toContain(
      '2026-10-13',
    );

    expect(compiled.textContent).toContain(
      'Not Started',
    );

    expect(
      component.startOnboardingForm.controls.employee.value,
    ).toBe('');

    expect(
      component.startOnboardingForm.controls.department.value,
    ).toBe('');

    expect(
      component.startOnboardingForm.controls.startDate.value,
    ).toBe('');
  });
});
