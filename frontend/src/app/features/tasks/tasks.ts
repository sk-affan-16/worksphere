import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { EmptyState } from '../../shared/components/empty-state/empty-state';

type TaskStatus = 'To Do' | 'In Progress' | 'Completed';

type TaskPriority = 'Low' | 'Medium' | 'High';

interface DemoTask {
  title: string;
  assignee: string;
  department: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
}

@Component({
  selector: 'app-tasks',
  imports: [FormsModule, EmptyState],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css',
})
export class Tasks {
  readonly searchTerm = signal('');
  readonly statusFilter = signal<'All' | TaskStatus>('All');
  readonly priorityFilter = signal<'All' | TaskPriority>('All');

  /*
   * Temporary frontend demo data.
   * This is not the backend tasks API contract.
   */
  private readonly demoTasks: DemoTask[] = [
    {
      title: 'Complete joining documentation',
      assignee: 'Aarav Sharma',
      department: 'Engineering',
      dueDate: '2026-10-10',
      priority: 'High',
      status: 'In Progress',
    },
    {
      title: 'Review employee profile',
      assignee: 'Priya Das',
      department: 'Human Resources',
      dueDate: '2026-10-11',
      priority: 'Medium',
      status: 'To Do',
    },
    {
      title: 'Verify bank details',
      assignee: 'Rahul Verma',
      department: 'Finance',
      dueDate: '2026-10-09',
      priority: 'High',
      status: 'Completed',
    },
    {
      title: 'Prepare workstation',
      assignee: 'Sneha Patel',
      department: 'Operations',
      dueDate: '2026-10-12',
      priority: 'Low',
      status: 'To Do',
    },
    {
      title: 'Schedule induction session',
      assignee: 'Vikram Singh',
      department: 'Human Resources',
      dueDate: '2026-10-14',
      priority: 'Medium',
      status: 'In Progress',
    },
  ];

  readonly filteredTasks = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();
    const priority = this.priorityFilter();

    return this.demoTasks.filter((task) => {
      const matchesSearch =
        !search ||
        task.title.toLowerCase().includes(search) ||
        task.assignee.toLowerCase().includes(search) ||
        task.department.toLowerCase().includes(search);

      const matchesStatus =
        status === 'All' || task.status === status;

      const matchesPriority =
        priority === 'All' || task.priority === priority;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  });

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
    task: DemoTask,
  ): string {
    return `${task.assignee}-${task.title}`;
  }
}
