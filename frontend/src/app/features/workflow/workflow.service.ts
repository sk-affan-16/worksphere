import { Injectable, signal } from '@angular/core';

export type WorkflowStatus =
  | 'Draft'
  | 'Active'
  | 'Completed';

export interface WorkflowRecord {
  name: string;
  description: string;
  owner: string;
  steps: number;
  completedSteps: number;
  status: WorkflowStatus;
}

@Injectable({
  providedIn: 'root',
})
export class WorkflowService {
  private readonly storageKey = 'worksphere_workflows';

  private readonly workflows = signal<WorkflowRecord[]>(
    this.loadWorkflows(),
  );

  readonly workflowList = this.workflows.asReadonly();

  addWorkflow(workflow: WorkflowRecord): void {
    this.workflows.update((workflows) => {
      const updatedWorkflows = [...workflows, workflow];
      this.saveWorkflows(updatedWorkflows);
      return updatedWorkflows;
    });
  }

  advanceWorkflow(workflowName: string): void {
    this.workflows.update((workflows) => {
      let changed = false;

      const updatedWorkflows = workflows.map((workflow) => {
        if (workflow.name !== workflowName) {
          return workflow;
        }

        if (workflow.completedSteps >= workflow.steps) {
          return workflow;
        }

        const completedSteps =
          workflow.completedSteps + 1;

        const status: WorkflowStatus =
          completedSteps >= workflow.steps
            ? 'Completed'
            : 'Active';

        changed = true;

        return {
          ...workflow,
          completedSteps,
          status,
        };
      });

      if (changed) {
        this.saveWorkflows(updatedWorkflows);
      }

      return updatedWorkflows;
    });
  }

  private loadWorkflows(): WorkflowRecord[] {
    const storedWorkflows = localStorage.getItem(
      this.storageKey,
    );

    if (!storedWorkflows) {
      return this.getDefaultWorkflows();
    }

    try {
      const parsedWorkflows = JSON.parse(storedWorkflows);

      if (Array.isArray(parsedWorkflows)) {
        return parsedWorkflows as WorkflowRecord[];
      }
    } catch {
      // Fall back to the default demo data.
    }

    return this.getDefaultWorkflows();
  }

  private saveWorkflows(
    workflows: WorkflowRecord[],
  ): void {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify(workflows),
    );
  }

  private getDefaultWorkflows(): WorkflowRecord[] {
    return [
      {
        name: 'Employee Onboarding',
        description:
          'Standard process for new employees.',
        owner: 'Human Resources',
        steps: 5,
        completedSteps: 5,
        status: 'Completed',
      },
      {
        name: 'New Hire Setup',
        description:
          'IT and workplace preparation process.',
        owner: 'Operations',
        steps: 6,
        completedSteps: 4,
        status: 'Active',
      },
      {
        name: 'Document Verification',
        description:
          'Review and approval of employee documents.',
        owner: 'Human Resources',
        steps: 4,
        completedSteps: 2,
        status: 'Active',
      },
      {
        name: 'Employee Exit',
        description:
          'Offboarding and clearance process.',
        owner: 'Human Resources',
        steps: 5,
        completedSteps: 0,
        status: 'Draft',
      },
    ];
  }
}
