import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tasks } from './tasks';

describe('Tasks', () => {
  let component: Tasks;
  let fixture: ComponentFixture<Tasks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tasks],
    }).compileComponents();

    fixture = TestBed.createComponent(Tasks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render task records', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const rows = compiled.querySelectorAll('tbody tr');

    expect(rows.length).toBe(5);
  });

  it('should filter tasks by assignee name', () => {
    component.updateSearch('Priya');

    expect(component.filteredTasks().length).toBe(1);
    expect(component.filteredTasks()[0].assignee).toBe(
      'Priya Das',
    );
  });

  it('should filter tasks by status', () => {
    component.updateStatus('Completed');

    expect(component.filteredTasks().length).toBe(1);
    expect(component.filteredTasks()[0].title).toBe(
      'Verify bank details',
    );
  });

  it('should filter tasks by priority', () => {
    component.updatePriority('High');

    expect(component.filteredTasks().length).toBe(2);
  });

  it('should label the task tracker table', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const table = compiled.querySelector('table');
    const heading = compiled.querySelector(
      '#task-tracker-title',
    );

    expect(heading?.textContent?.trim()).toBe(
      'Task Tracker',
    );

    expect(
      table?.getAttribute('aria-labelledby'),
    ).toBe('task-tracker-title');
  });

  it('should mark task table headers as column headers', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const headers = Array.from(
      compiled.querySelectorAll('thead th'),
    );

    expect(headers.length).toBe(6);
    expect(
      headers.every(
        (header) => header.getAttribute('scope') === 'col',
      ),
    ).toBe(true);
  });

  it('should display the empty state when no tasks match the filter', () => {
    component.updateSearch(
      'task-that-does-not-exist',
    );
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector('app-empty-state'),
    ).toBeTruthy();

    expect(compiled.textContent).toContain(
      'No tasks found',
    );
  });

  it('should open the create task form', () => {
    component.openCreateTask();
    fixture.detectChanges();

    expect(component.isCreateTaskOpen()).toBe(true);

    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector('#task-title'),
    ).toBeTruthy();

    expect(
      compiled.querySelector('#task-assignee'),
    ).toBeTruthy();
  });

  it('should keep the create task form open when submitted empty', () => {
    component.openCreateTask();

    component.saveTask();

    expect(component.createTaskForm.invalid).toBe(true);
    expect(component.createTaskSubmitted()).toBe(true);
    expect(component.isCreateTaskOpen()).toBe(true);
  });

  it('should create a new task with To Do status', () => {
    component.openCreateTask();

    component.createTaskForm.setValue({
      title: 'Prepare access credentials',
      assignee: 'Maya Sen',
      department: 'IT',
      dueDate: '2026-10-20',
      priority: 'High',
    });

    component.saveTask();
    fixture.detectChanges();

    expect(component.isCreateTaskOpen()).toBe(false);
    expect(component.filteredTasks().length).toBe(6);

    const newTask = component
      .filteredTasks()
      .find(
        (task) =>
          task.title === 'Prepare access credentials',
      );

    expect(newTask).toBeTruthy();
    expect(newTask?.assignee).toBe('Maya Sen');
    expect(newTask?.department).toBe('IT');
    expect(newTask?.dueDate).toBe('2026-10-20');
    expect(newTask?.priority).toBe('High');
    expect(newTask?.status).toBe('To Do');
  });

  it('should reset the create task form when cancelled', () => {
    component.openCreateTask();

    component.createTaskForm.setValue({
      title: 'Temporary task',
      assignee: 'Maya Sen',
      department: 'IT',
      dueDate: '2026-10-20',
      priority: 'High',
    });

    component.closeCreateTask();

    expect(component.isCreateTaskOpen()).toBe(false);
    expect(
      component.createTaskForm.getRawValue(),
    ).toEqual({
      title: '',
      assignee: '',
      department: '',
      dueDate: '',
      priority: 'Medium',
    });
  });
});
