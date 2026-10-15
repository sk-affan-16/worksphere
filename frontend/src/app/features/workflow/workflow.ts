import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { EmptyState } from '../../shared/components/empty-state/empty-state';
import {
  WorkflowService,
  WorkflowStatus,
  WorkflowRecord,
} from './workflow.service';

@Component({
  selector: 'app-workflow',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EmptyState,
  ],
  templateUrl: './workflow.html',
  styleUrl: './workflow.css',
})
export class Workflow {
  readonly createWorkflowForm;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly workflowService: WorkflowService,
  ) {
    this.createWorkflowForm =
      this.formBuilder.nonNullable.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        description: [
          '',
          [Validators.required, Validators.minLength(5)],
        ],
        owner: ['', [Validators.required, Validators.minLength(2)]],
        steps: [1, [Validators.required, Validators.min(1)]],
      });
  }

  readonly createWorkflowSubmitted = signal(false);
  readonly isCreateWorkflowOpen = signal(false);

  readonly searchTerm = signal('');
  readonly statusFilter = signal<
    'All' | WorkflowStatus
  >('All');

  readonly filteredWorkflows = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.workflowService.workflowList().filter(
      (workflow) => {
        const matchesSearch =
          !search ||
          workflow.name.toLowerCase().includes(search) ||
          workflow.description
            .toLowerCase()
            .includes(search) ||
          workflow.owner.toLowerCase().includes(search);

        const matchesStatus =
          status === 'All' ||
          workflow.status === status;

        return matchesSearch && matchesStatus;
      },
    );
  });

  openCreateWorkflow(): void {
    this.createWorkflowSubmitted.set(false);

    this.createWorkflowForm.reset({
      name: '',
      description: '',
      owner: '',
      steps: 1,
    });

    this.isCreateWorkflowOpen.set(true);
  }

  closeCreateWorkflow(): void {
    this.createWorkflowSubmitted.set(false);

    this.createWorkflowForm.reset({
      name: '',
      description: '',
      owner: '',
      steps: 1,
    });

    this.isCreateWorkflowOpen.set(false);
  }

  saveWorkflow(): void {
    this.createWorkflowSubmitted.set(true);

    if (this.createWorkflowForm.invalid) {
      this.createWorkflowForm.markAllAsTouched();
      return;
    }

    const formValue = this.createWorkflowForm.getRawValue();

    const workflow: WorkflowRecord = {
      name: formValue.name.trim(),
      description: formValue.description.trim(),
      owner: formValue.owner.trim(),
      steps: formValue.steps,
      completedSteps: 0,
      status: 'Draft',
    };

    this.workflowService.addWorkflow(workflow);

    this.createWorkflowForm.reset({
      name: '',
      description: '',
      owner: '',
      steps: 1,
    });

    this.createWorkflowSubmitted.set(false);
    this.isCreateWorkflowOpen.set(false);
  }

  advanceWorkflow(workflowName: string): void {
    this.workflowService.advanceWorkflow(workflowName);
  }

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
    workflow: WorkflowRecord,
  ): string {
    return workflow.name;
  }
}
