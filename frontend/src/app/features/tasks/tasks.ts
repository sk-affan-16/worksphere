import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { Auth } from '../../core/auth/auth';
import { AuthApiService } from '../../core/auth/auth-api.service';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import {
  CreateTaskRequest,
  TaskPriority,
  TaskResponse,
  TaskStatus,
  TasksApiService,
} from './tasks-api.service';

type StatusFilter = 'ALL' | TaskStatus;
type PriorityFilter = 'ALL' | TaskPriority;

@Component({
  selector: 'app-tasks',
  imports: [FormsModule, ReactiveFormsModule, EmptyState],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css',
})
export class Tasks implements OnInit {
  readonly createTaskForm;

  readonly createTaskSubmitted = signal(false);
  readonly isCreateTaskOpen = signal(false);

  readonly searchTerm = signal('');
  readonly statusFilter = signal<StatusFilter>('ALL');
  readonly priorityFilter = signal<PriorityFilter>('ALL');

  readonly tasks = signal<TaskResponse[]>([]);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly updatingTaskIds = signal<number[]>([]);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly isAdmin = computed(() => this.auth.role() === 'ORG_ADMIN');

  readonly filteredTasks = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();
    const priority = this.priorityFilter();

    return this.tasks().filter((task) => {
      const matchesSearch =
        !search ||
        task.title.toLowerCase().includes(search) ||
        task.assigneeName.toLowerCase().includes(search) ||
        task.assigneeEmail.toLowerCase().includes(search) ||
        (task.department ?? '').toLowerCase().includes(search);

      return (
        matchesSearch &&
        (status === 'ALL' || task.status === status) &&
        (priority === 'ALL' || task.priority === priority)
      );
    });
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly tasksApi: TasksApiService,
    private readonly auth: Auth,
    private readonly authApi: AuthApiService,
  ) {
    this.createTaskForm = this.formBuilder.nonNullable.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(200),
        ],
      ],
      assigneeEmail: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.maxLength(254),
        ],
      ],
      dueDate: ['', [Validators.required]],
      priority: ['MEDIUM' as TaskPriority, [Validators.required]],
    });
  }

  ngOnInit(): void {
    // On a browser refresh, the shell may still be restoring the user's role.
    // Resolve the current user before choosing the role-protected task endpoint.
    if (this.auth.role()) {
      this.loadTasks();
      return;
    }

    this.authApi.getCurrentUser().subscribe({
      next: (user) => {
        this.auth.setCurrentUser(user);
        this.loadTasks();
      },
      error: (error: unknown) => {
        this.errorMessage.set(
          this.getErrorMessage(
            error,
            'Unable to verify your account. Refresh the page and try again.',
          ),
        );
      },
    });
  }

  loadTasks(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const request = this.isAdmin()
      ? this.tasksApi.getOrganizationTasks()
      : this.tasksApi.getMyTasks();

    request.subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          this.getErrorMessage(
            error,
            'Unable to load tasks. Please try again.',
          ),
        );
      },
    });
  }

  openCreateTask(): void {
    if (!this.isAdmin()) {
      return;
    }

    this.createTaskSubmitted.set(false);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.createTaskForm.reset({
      title: '',
      assigneeEmail: '',
      dueDate: '',
      priority: 'MEDIUM',
    });

    this.isCreateTaskOpen.set(true);
  }

  closeCreateTask(): void {
    this.createTaskSubmitted.set(false);

    this.createTaskForm.reset({
      title: '',
      assigneeEmail: '',
      dueDate: '',
      priority: 'MEDIUM',
    });

    this.isCreateTaskOpen.set(false);
  }

  saveTask(): void {
    this.createTaskSubmitted.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    // Prevent duplicate submissions.
    if (this.isSaving()) {
      return;
    }

    // Normalize user input before validating it.
    // This allows valid values with surrounding spaces.
    const titleControl = this.createTaskForm.controls.title;
    const emailControl = this.createTaskForm.controls.assigneeEmail;

    titleControl.setValue(titleControl.value.trim(), {
      emitEvent: false,
    });

    emailControl.setValue(emailControl.value.trim(), {
      emitEvent: false,
    });

    titleControl.updateValueAndValidity({
      emitEvent: false,
    });

    emailControl.updateValueAndValidity({
      emitEvent: false,
    });

    if (this.createTaskForm.invalid) {
      this.createTaskForm.markAllAsTouched();
      return;
    }

    const formValue = this.createTaskForm.getRawValue();

    const request: CreateTaskRequest = {
      title: formValue.title.trim(),
      assigneeEmail: formValue.assigneeEmail.trim().toLowerCase(),
      dueDate: formValue.dueDate,
      priority: formValue.priority,
    };

    this.isSaving.set(true);

    this.tasksApi.createTask(request).subscribe({
      next: (createdTask) => {
        this.tasks.update((tasks) => [createdTask, ...tasks]);

        this.isSaving.set(false);
        this.closeCreateTask();
        this.successMessage.set('Task created successfully.');
      },
      error: (error: unknown) => {
        this.isSaving.set(false);

        this.errorMessage.set(
          this.getErrorMessage(
            error,
            'Unable to create the task. Please check the assignee email and try again.',
          ),
        );
      },
    });
  }

  updateTaskStatus(task: TaskResponse, statusValue: string): void {
    if (this.updatingTaskIds().includes(task.id)) {
      return;
    }

    if (
      statusValue !== 'TO_DO' &&
      statusValue !== 'IN_PROGRESS' &&
      statusValue !== 'COMPLETED'
    ) {
      return;
    }

    const status = statusValue as TaskStatus;

    if (status === task.status) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    this.updatingTaskIds.update((ids) => [...ids, task.id]);

    this.tasksApi.updateTaskStatus(task.id, { status }).subscribe({
      next: (updatedTask) => {
        this.tasks.update((tasks) =>
          tasks.map((item) =>
            item.id === updatedTask.id ? updatedTask : item,
          ),
        );

        this.updatingTaskIds.update((ids) =>
          ids.filter((id) => id !== task.id),
        );

        this.successMessage.set('Task status updated.');
      },
      error: (error: unknown) => {
        this.updatingTaskIds.update((ids) =>
          ids.filter((id) => id !== task.id),
        );

        this.errorMessage.set(
          this.getErrorMessage(
            error,
            'Unable to update task status. Please try again.',
          ),
        );
      },
    });
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
  }

  updateStatus(value: string): void {
    if (value === 'ALL' || this.isTaskStatus(value)) {
      this.statusFilter.set(value as StatusFilter);
    }
  }

  updatePriority(value: string): void {
    if (value === 'ALL' || this.isTaskPriority(value)) {
      this.priorityFilter.set(value as PriorityFilter);
    }
  }

  statusLabel(status: TaskStatus): string {
    switch (status) {
      case 'TO_DO':
        return 'To Do';

      case 'IN_PROGRESS':
        return 'In Progress';

      case 'COMPLETED':
        return 'Completed';
    }
  }

  priorityLabel(priority: TaskPriority): string {
    return priority.charAt(0) + priority.slice(1).toLowerCase();
  }

  protected trackTask(_index: number, task: TaskResponse): number {
    return task.id;
  }

  private isTaskStatus(value: string): value is TaskStatus {
    return (
      value === 'TO_DO' ||
      value === 'IN_PROGRESS' ||
      value === 'COMPLETED'
    );
  }

  private isTaskPriority(value: string): value is TaskPriority {
    return value === 'LOW' || value === 'MEDIUM' || value === 'HIGH';
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error?.detail === 'string') {
        return error.error.detail;
      }

      if (typeof error.error?.message === 'string') {
        return error.error.message;
      }

      if (error.status === 0) {
        return 'Cannot reach the server. Check that the backend is running.';
      }

      if (error.status === 403) {
        return 'You do not have permission to perform this action.';
      }

      if (error.status === 404) {
        return 'The employee or task could not be found in your organization.';
      }

      if (error.status === 409) {
        return 'This employee is disabled and cannot be assigned a task.';
      }

      if (error.status === 400) {
        return 'Some task details are invalid. Check the form and try again.';
      }
    }

    return fallback;
  }
}
