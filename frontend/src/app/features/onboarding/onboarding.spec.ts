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
});
