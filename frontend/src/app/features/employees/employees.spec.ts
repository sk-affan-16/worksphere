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
    expect(component.filteredEmployees()[0].name).toBe(
      'Priya Das',
    );
  });

  it('should filter employees by status', () => {
    component.updateStatus('Inactive');

    expect(component.filteredEmployees().length).toBe(1);
    expect(component.filteredEmployees()[0].name).toBe(
      'Sneha Patel',
    );
  });

  it('should search employees case-insensitively', () => {
    component.updateSearch('priya');

    expect(component.filteredEmployees().length).toBe(1);
    expect(component.filteredEmployees()[0].name).toBe(
      'Priya Das',
    );
  });

  it('should return all employees when status is All', () => {
    component.updateStatus('All');

    expect(component.filteredEmployees().length).toBe(6);
  });

  it('should label the employee directory table', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const table = compiled.querySelector('table');
    const heading = compiled.querySelector(
      '#employee-directory-title',
    );

    expect(heading?.textContent?.trim()).toBe(
      'Employee Directory',
    );

    expect(
      table?.getAttribute('aria-labelledby'),
    ).toBe('employee-directory-title');
  });

  it('should mark employee table headers as column headers', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const headers = Array.from(
      compiled.querySelectorAll('thead th'),
    );

    expect(headers.length).toBe(4);
    expect(
      headers.every(
        (header) => header.getAttribute('scope') === 'col',
      ),
    ).toBe(true);
  });

  it('should hide employee avatar initials from screen readers', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const avatars = Array.from(
      compiled.querySelectorAll('.employee-avatar'),
    );

    expect(avatars.length).toBe(6);
    expect(
      avatars.every(
        (avatar) => avatar.getAttribute('aria-hidden') === 'true',
      ),
    ).toBe(true);
  });
});
