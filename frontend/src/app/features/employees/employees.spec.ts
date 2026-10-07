import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Employees } from './employees';

describe('Employees', () => {
  let component: Employees;
  let fixture: ComponentFixture<Employees>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Employees],
    }).compileComponents();

    fixture = TestBed.createComponent(Employees);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render employee rows', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const rows = compiled.querySelectorAll('tbody tr');

    expect(rows.length).toBe(6);
  });

  it('should filter employees by search term', () => {
    component.updateSearch('Priya');

    expect(component.filteredEmployees().length).toBe(1);
    expect(component.filteredEmployees()[0].name).toBe('Priya Das');
  });

  it('should filter employees by status', () => {
    component.updateStatus('Inactive');

    expect(component.filteredEmployees().length).toBe(1);
    expect(component.filteredEmployees()[0].name).toBe('Sneha Patel');
  });
});
