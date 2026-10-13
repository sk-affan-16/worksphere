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

  it('should open the create workflow form', () => {
    component.openCreateWorkflow();
    fixture.detectChanges();

    expect(component.isCreateWorkflowOpen()).toBe(true);

    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector('#workflow-name'),
    ).toBeTruthy();

    expect(
      compiled.querySelector('#workflow-description'),
    ).toBeTruthy();

    expect(
      compiled.querySelector('#workflow-owner'),
    ).toBeTruthy();

    expect(
      compiled.querySelector('#workflow-steps'),
    ).toBeTruthy();
  });

  it('should keep the create workflow form open when submitted empty', () => {
    component.openCreateWorkflow();

    component.saveWorkflow();

    expect(component.createWorkflowForm.invalid).toBe(true);
    expect(component.createWorkflowSubmitted()).toBe(true);
    expect(component.isCreateWorkflowOpen()).toBe(true);
  });

  it('should create a new workflow with Draft status', () => {
    component.openCreateWorkflow();

    component.createWorkflowForm.setValue({
      name: 'Employee Exit Process',
      description: 'Standard employee exit workflow',
      owner: 'Human Resources',
      steps: 5,
    });

    component.saveWorkflow();
    fixture.detectChanges();

    expect(component.isCreateWorkflowOpen()).toBe(false);
    expect(component.filteredWorkflows().length).toBe(5);

    const newWorkflow = component
      .filteredWorkflows()
      .find(
        (workflow) =>
          workflow.name === 'Employee Exit Process',
      );

    expect(newWorkflow).toBeTruthy();
    expect(newWorkflow?.description).toBe(
      'Standard employee exit workflow',
    );
    expect(newWorkflow?.owner).toBe('Human Resources');
    expect(newWorkflow?.steps).toBe(5);
    expect(newWorkflow?.completedSteps).toBe(0);
    expect(newWorkflow?.status).toBe('Draft');
  });

  it('should advance a workflow by one step', () => {
    component.advanceWorkflow('Employee Exit');

    const workflow = component
      .filteredWorkflows()
      .find(
        (item) => item.name === 'Employee Exit',
      );

    expect(workflow).toBeTruthy();
    expect(workflow?.completedSteps).toBe(1);
    expect(workflow?.steps).toBe(5);
    expect(workflow?.status).toBe('Active');
  });

  it('should complete a workflow when the final step is advanced', () => {
    component.advanceWorkflow('Employee Exit');
    component.advanceWorkflow('Employee Exit');
    component.advanceWorkflow('Employee Exit');
    component.advanceWorkflow('Employee Exit');
    component.advanceWorkflow('Employee Exit');

    const workflow = component
      .filteredWorkflows()
      .find(
        (item) => item.name === 'Employee Exit',
      );

    expect(workflow).toBeTruthy();
    expect(workflow?.completedSteps).toBe(5);
    expect(workflow?.steps).toBe(5);
    expect(workflow?.status).toBe('Completed');
  });

  it('should not advance a completed workflow beyond its total steps', () => {
    component.advanceWorkflow('Employee Exit');
    component.advanceWorkflow('Employee Exit');
    component.advanceWorkflow('Employee Exit');
    component.advanceWorkflow('Employee Exit');
    component.advanceWorkflow('Employee Exit');
    component.advanceWorkflow('Employee Exit');

    const workflow = component
      .filteredWorkflows()
      .find(
        (item) => item.name === 'Employee Exit',
      );

    expect(workflow).toBeTruthy();
    expect(workflow?.completedSteps).toBe(5);
    expect(workflow?.status).toBe('Completed');
  });
});
