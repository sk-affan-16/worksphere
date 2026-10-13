import { Injectable, signal } from '@angular/core';

export type TaskStatus =
  | 'To Do'
  | 'In Progress'
  | 'Completed';

export type TaskPriority =
  | 'Low'
  | 'Medium'
  | 'High';

export interface TaskRecord {
  title: string;
  assignee: string;
  department: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
}

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private readonly storageKey = 'worksphere_tasks';

  private readonly tasks = signal<TaskRecord[]>(
    this.loadTasks(),
  );

  readonly taskList = this.tasks.asReadonly();

  addTask(task: TaskRecord): void {
    this.tasks.update((tasks) => {
      const updatedTasks = [...tasks, task];
      this.saveTasks(updatedTasks);
      return updatedTasks;
    });
  }

  private loadTasks(): TaskRecord[] {
    const storedTasks = localStorage.getItem(
      this.storageKey,
    );

    if (!storedTasks) {
      return this.getDefaultTasks();
    }

    try {
      const parsedTasks = JSON.parse(storedTasks);

      if (Array.isArray(parsedTasks)) {
        return parsedTasks as TaskRecord[];
      }
    } catch {
      // Fall back to the default demo data.
    }

    return this.getDefaultTasks();
  }

  private saveTasks(tasks: TaskRecord[]): void {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify(tasks),
    );
  }

  private getDefaultTasks(): TaskRecord[] {
    return [
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
  }
}
