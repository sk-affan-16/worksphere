import { TestBed } from '@angular/core/testing';

import {
  TaskRecord,
  TasksService,
} from './tasks.service';

describe('TasksService', () => {
  const storageKey = 'worksphere_tasks';

  beforeEach(() => {
    localStorage.removeItem(storageKey);

    TestBed.configureTestingModule({
      providers: [TasksService],
    });
  });

  afterEach(() => {
    localStorage.removeItem(storageKey);
    TestBed.resetTestingModule();
  });

  it('should create the service', () => {
    const service = TestBed.inject(TasksService);

    expect(service).toBeTruthy();
  });

  it('should load the default demo tasks when storage is empty', () => {
    const service = TestBed.inject(TasksService);

    expect(service.taskList().length).toBe(5);
  });

  it('should add a task to the task list', () => {
    const service = TestBed.inject(TasksService);

    const newTask: TaskRecord = {
      title: 'Prepare access credentials',
      assignee: 'Maya Sen',
      department: 'IT',
      dueDate: '2026-10-20',
      priority: 'High',
      status: 'To Do',
    };

    service.addTask(newTask);

    expect(service.taskList().length).toBe(6);
    expect(service.taskList()[5]).toEqual(newTask);
  });

  it('should persist a newly added task to localStorage', () => {
    const service = TestBed.inject(TasksService);

    const newTask: TaskRecord = {
      title: 'Prepare access credentials',
      assignee: 'Maya Sen',
      department: 'IT',
      dueDate: '2026-10-20',
      priority: 'High',
      status: 'To Do',
    };

    service.addTask(newTask);

    const storedTasks = JSON.parse(
      localStorage.getItem(storageKey) ?? '[]',
    ) as TaskRecord[];

    expect(storedTasks.length).toBe(6);
    expect(storedTasks[5]).toEqual(newTask);
  });

  it('should load previously stored tasks from localStorage', () => {
    const storedTasks: TaskRecord[] = [
      {
        title: 'Persisted task',
        assignee: 'Maya Sen',
        department: 'IT',
        dueDate: '2026-10-21',
        priority: 'Medium',
        status: 'To Do',
      },
    ];

    localStorage.setItem(
      storageKey,
      JSON.stringify(storedTasks),
    );

    const service = TestBed.inject(TasksService);

    expect(service.taskList()).toEqual(storedTasks);
  });

  it('should fall back to default tasks when stored data is invalid', () => {
    localStorage.setItem(
      storageKey,
      'invalid-json',
    );

    const service = TestBed.inject(TasksService);

    expect(service.taskList().length).toBe(5);
  });
});
