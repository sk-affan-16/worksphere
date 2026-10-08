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
});
