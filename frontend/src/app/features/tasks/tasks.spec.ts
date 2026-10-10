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
    expect(component.filteredTasks()[0].assignee).toBe('Priya Das');
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
});
