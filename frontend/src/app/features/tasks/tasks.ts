import { Component, computed, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { EmptyState } from '../../shared/components/empty-state/empty-state';
import {
  TaskPriority,
  TaskStatus,
  TasksService,
} from './tasks.service';

@Component({
  selector: 'app-tasks',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    EmptyState,
  ],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css',
})
export class Tasks {
  readonly createTaskForm;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly tasksService: TasksService,
  ) {
    this.createTaskForm = this.formBuilder.nonNullable.group({
      title: [
        '',
        [Validators.required, Validators.minLength(2)],
      ],
      assignee: [
        '',
        [Validators.required, Validators.minLength(2)],
      ],
      department: [
        '',
        [Validators.required],
      ],
      dueDate: [
        '',
        [Validators.required],
      ],
      priority: [
        'Medium' as TaskPriority,
        [Validators.required],
      ],
    });
  }

  readonly createTaskSubmitted = signal(false);
  readonly isCreateTaskOpen = signal(false);

  readonly searchTerm = signal('');
  readonly statusFilter = signal<
    'All' | TaskStatus
  >('All');
  readonly priorityFilter = signal<
    'All' | TaskPriority
  >('All');

  readonly filteredTasks = computed(() => {
    const search = this.searchTerm()
      .trim()
      .toLowerCase();

    const status = this.statusFilter();
    const priority = this.priorityFilter();

    return this.tasksService.taskList().filter((task) => {
      const matchesSearch =
        !search ||
        task.title.toLowerCase().includes(search) ||
        task.assignee.toLowerCase().includes(search) ||
        task.department.toLowerCase().includes(search);

      const matchesStatus =
        status === 'All' ||
        task.status === status;

      const matchesPriority =
        priority === 'All' ||
        task.priority === priority;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  });

  openCreateTask(): void {
    this.createTaskSubmitted.set(false);

    this.createTaskForm.reset({
      title: '',
      assignee: '',
      department: '',
      dueDate: '',
      priority: 'Medium',
    });

    this.isCreateTaskOpen.set(true);
  }

  closeCreateTask(): void {
    this.createTaskSubmitted.set(false);

    this.createTaskForm.reset({
      title: '',
      assignee: '',
      department: '',
      dueDate: '',
      priority: 'Medium',
    });

    this.isCreateTaskOpen.set(false);
  }

  saveTask(): void {
    this.createTaskSubmitted.set(true);

    if (this.createTaskForm.invalid) {
      this.createTaskForm.markAllAsTouched();
      return;
    }

    const formValue =
      this.createTaskForm.getRawValue();

    this.tasksService.addTask({
      title: formValue.title.trim(),
      assignee: formValue.assignee.trim(),
      department: formValue.department.trim(),
      dueDate: formValue.dueDate,
      priority: formValue.priority,
      status: 'To Do',
    });

    this.createTaskForm.reset({
      title: '',
      assignee: '',
      department: '',
      dueDate: '',
      priority: 'Medium',
    });

    this.createTaskSubmitted.set(false);
    this.isCreateTaskOpen.set(false);
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
  }

  updateStatus(value: string): void {
    if (
      value === 'All' ||
      value === 'To Do' ||
      value === 'In Progress' ||
      value === 'Completed'
    ) {
      this.statusFilter.set(value);
    }
  }

  updatePriority(value: string): void {
    if (
      value === 'All' ||
      value === 'Low' ||
      value === 'Medium' ||
      value === 'High'
    ) {
      this.priorityFilter.set(value);
    }
  }

  protected trackTask(
    _index: number,
    task: {
      title: string;
      assignee: string;
      department: string;
    },
  ): string {
    return `${task.assignee}-${task.title}`;
  }
}
