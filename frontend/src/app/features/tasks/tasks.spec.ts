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
});
