import { TestBed } from '@angular/core/testing';

import {
  WorkflowRecord,
  WorkflowService,
} from './workflow.service';

describe('WorkflowService', () => {
  const storageKey = 'worksphere_workflows';

  beforeEach(() => {
    localStorage.removeItem(storageKey);

    TestBed.configureTestingModule({
      providers: [WorkflowService],
    });
  });

  afterEach(() => {
    localStorage.removeItem(storageKey);
    TestBed.resetTestingModule();
  });

  it('should create the service', () => {
    const service = TestBed.inject(WorkflowService);

    expect(service).toBeTruthy();
  });

  it('should load the default demo workflows when storage is empty', () => {
    const service = TestBed.inject(WorkflowService);

    expect(service.workflowList().length).toBe(4);
  });

  it('should add a workflow to the workflow list', () => {
    const service = TestBed.inject(WorkflowService);

    const newWorkflow: WorkflowRecord = {
      name: 'Employee Clearance',
      description: 'Standard employee clearance process',
      owner: 'Human Resources',
      steps: 4,
      completedSteps: 0,
      status: 'Draft',
    };

    service.addWorkflow(newWorkflow);

    expect(service.workflowList().length).toBe(5);
    expect(service.workflowList()[4]).toEqual(newWorkflow);
  });

  it('should persist a newly added workflow to localStorage', () => {
    const service = TestBed.inject(WorkflowService);

    const newWorkflow: WorkflowRecord = {
      name: 'Employee Clearance',
      description: 'Standard employee clearance process',
      owner: 'Human Resources',
      steps: 4,
      completedSteps: 0,
      status: 'Draft',
    };

    service.addWorkflow(newWorkflow);

    const storedWorkflows = JSON.parse(
      localStorage.getItem(storageKey) ?? '[]',
    ) as WorkflowRecord[];

    expect(storedWorkflows.length).toBe(5);
    expect(storedWorkflows[4]).toEqual(newWorkflow);
  });

  it('should load previously stored workflows from localStorage', () => {
    const storedWorkflows: WorkflowRecord[] = [
      {
        name: 'Persisted Workflow',
        description: 'Stored workflow for testing',
        owner: 'Operations',
        steps: 3,
        completedSteps: 1,
        status: 'Active',
      },
    ];

    localStorage.setItem(
      storageKey,
      JSON.stringify(storedWorkflows),
    );

    const service = TestBed.inject(WorkflowService);

    expect(service.workflowList()).toEqual(
      storedWorkflows,
    );
  });

  it('should advance a workflow and persist the new progress', () => {
    const service = TestBed.inject(WorkflowService);

    service.advanceWorkflow('Employee Exit');

    const workflow = service
      .workflowList()
      .find((item) => item.name === 'Employee Exit');

    expect(workflow).toBeTruthy();
    expect(workflow?.completedSteps).toBe(1);
    expect(workflow?.status).toBe('Active');

    const storedWorkflows = JSON.parse(
      localStorage.getItem(storageKey) ?? '[]',
    ) as WorkflowRecord[];

    const storedWorkflow = storedWorkflows.find(
      (item) => item.name === 'Employee Exit',
    );

    expect(storedWorkflow?.completedSteps).toBe(1);
    expect(storedWorkflow?.status).toBe('Active');
  });

  it('should mark a workflow completed on the final step', () => {
    const service = TestBed.inject(WorkflowService);

    for (let step = 0; step < 5; step += 1) {
      service.advanceWorkflow('Employee Exit');
    }

    const workflow = service
      .workflowList()
      .find((item) => item.name === 'Employee Exit');

    expect(workflow).toBeTruthy();
    expect(workflow?.completedSteps).toBe(5);
    expect(workflow?.status).toBe('Completed');
  });

  it('should not advance a completed workflow beyond its total steps', () => {
    const service = TestBed.inject(WorkflowService);

    for (let step = 0; step < 6; step += 1) {
      service.advanceWorkflow('Employee Exit');
    }

    const workflow = service
      .workflowList()
      .find((item) => item.name === 'Employee Exit');

    expect(workflow).toBeTruthy();
    expect(workflow?.completedSteps).toBe(5);
    expect(workflow?.status).toBe('Completed');
  });

  it('should fall back to default workflows when stored data is invalid', () => {
    localStorage.setItem(
      storageKey,
      'invalid-json',
    );

    const service = TestBed.inject(WorkflowService);

    expect(service.workflowList().length).toBe(4);
  });
});
