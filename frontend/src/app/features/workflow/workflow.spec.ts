import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Workflow } from './workflow';

describe('Workflow', () => {
  let component: Workflow;
  let fixture: ComponentFixture<Workflow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Workflow],
    }).compileComponents();

    fixture = TestBed.createComponent(Workflow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render workflow records', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const cards = compiled.querySelectorAll('.workflow-card');

    expect(cards.length).toBe(4);
  });

  it('should filter workflows by name', () => {
    component.updateSearch('Employee Onboarding');

    expect(component.filteredWorkflows().length).toBe(1);
    expect(component.filteredWorkflows()[0].name).toBe(
      'Employee Onboarding',
    );
  });

  it('should filter workflows by status', () => {
    component.updateStatus('Active');

    expect(component.filteredWorkflows().length).toBe(2);
  });

  it('should filter workflows by owner', () => {
    component.updateSearch('Operations');

    expect(component.filteredWorkflows().length).toBe(1);
    expect(component.filteredWorkflows()[0].name).toBe(
      'New Hire Setup',
    );
  });

  it('should provide accessible names for workflow cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const cards = Array.from(
      compiled.querySelectorAll<HTMLElement>(
        '.workflow-card',
      ),
    );

    expect(cards.length).toBe(4);

    expect(
      cards.every((card) => {
        const labelledBy =
          card.getAttribute('aria-labelledby');

        return (
          labelledBy !== null &&
          card.querySelector(`#${labelledBy}`) !== null
        );
      }),
    ).toBe(true);
  });

  it('should expose workflow progress accessibly', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const progressBars = Array.from(
      compiled.querySelectorAll<HTMLElement>(
        '.progress-bar[role="progressbar"]',
      ),
    );

    expect(progressBars.length).toBe(4);

    expect(
      progressBars.every(
        (progressBar) =>
          progressBar.getAttribute('aria-valuemin') === '0' &&
          progressBar.getAttribute('aria-valuemax') === '100' &&
          progressBar.hasAttribute('aria-valuenow') &&
          progressBar.hasAttribute('aria-label'),
      ),
    ).toBe(true);
  });

  it('should display the empty state when no workflows match the filter', () => {
    component.updateSearch(
      'workflow-that-does-not-exist',
    );
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector('app-empty-state'),
    ).toBeTruthy();

    expect(compiled.textContent).toContain(
      'No workflows found',
    );
  });
});
