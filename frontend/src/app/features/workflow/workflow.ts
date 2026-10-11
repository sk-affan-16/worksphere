import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { EmptyState } from '../../shared/components/empty-state/empty-state';

type WorkflowStatus =
  | 'Draft'
  | 'Active'
  | 'Completed';

interface DemoWorkflow {
  name: string;
  description: string;
  owner: string;
  steps: number;
  completedSteps: number;
  status: WorkflowStatus;
}

@Component({
  selector: 'app-workflow',
  imports: [CommonModule, FormsModule, EmptyState],
  templateUrl: './workflow.html',
  styleUrl: './workflow.css',
})
export class Workflow {
  readonly searchTerm = signal('');
  readonly statusFilter = signal<
    'All' | WorkflowStatus
  >('All');

  /*
   * Temporary frontend demo data.
   * This is not the backend workflow API contract.
   */
  private readonly demoWorkflows: DemoWorkflow[] = [
    {
      name: 'Employee Onboarding',
      description: 'Standard process for new employees.',
      owner: 'Human Resources',
      steps: 5,
      completedSteps: 5,
      status: 'Completed',
    },
    {
      name: 'New Hire Setup',
      description: 'IT and workplace preparation process.',
      owner: 'Operations',
      steps: 6,
      completedSteps: 4,
      status: 'Active',
    },
    {
      name: 'Document Verification',
      description: 'Review and approval of employee documents.',
      owner: 'Human Resources',
      steps: 4,
      completedSteps: 2,
      status: 'Active',
    },
    {
      name: 'Employee Exit',
      description: 'Offboarding and clearance process.',
      owner: 'Human Resources',
      steps: 5,
      completedSteps: 0,
      status: 'Draft',
    },
  ];

  readonly filteredWorkflows = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.demoWorkflows.filter((workflow) => {
      const matchesSearch =
        !search ||
        workflow.name.toLowerCase().includes(search) ||
        workflow.description.toLowerCase().includes(search) ||
        workflow.owner.toLowerCase().includes(search);

      const matchesStatus =
        status === 'All' ||
        workflow.status === status;

      return matchesSearch && matchesStatus;
    });
  });

  updateSearch(value: string): void {
    this.searchTerm.set(value);
  }

  updateStatus(value: string): void {
    if (
      value === 'All' ||
      value === 'Draft' ||
      value === 'Active' ||
      value === 'Completed'
    ) {
      this.statusFilter.set(value);
    }
  }

  protected trackWorkflow(
    _index: number,
    workflow: DemoWorkflow,
  ): string {
    return workflow.name;
  }
}
