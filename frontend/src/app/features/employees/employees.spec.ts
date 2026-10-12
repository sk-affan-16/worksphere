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

  it('should open the add employee form', () => {
    expect(component.isAddEmployeeOpen()).toBe(false);

    component.openAddEmployee();
    fixture.detectChanges();

    expect(component.isAddEmployeeOpen()).toBe(true);

    const form = fixture.nativeElement.querySelector(
      '.add-employee-card',
    );

    expect(form).toBeTruthy();
  });

  it('should close the add employee form', () => {
    component.openAddEmployee();
    fixture.detectChanges();

    expect(component.isAddEmployeeOpen()).toBe(true);

    component.closeAddEmployee();
    fixture.detectChanges();

    expect(component.isAddEmployeeOpen()).toBe(false);

    const form = fixture.nativeElement.querySelector(
      '.add-employee-card',
    );

    expect(form).toBeNull();
  });

  it('should validate all add employee fields when saving an empty form', () => {
    component.openAddEmployee();
    fixture.detectChanges();

    component.saveEmployee();
    fixture.detectChanges();

    expect(
      component.addEmployeeSubmitted(),
    ).toBe(true);

    expect(
      component.addEmployeeForm.controls.name.touched,
    ).toBe(true);

    expect(
      component.addEmployeeForm.controls.email.touched,
    ).toBe(true);

    expect(
      component.addEmployeeForm.controls.department.touched,
    ).toBe(true);

    expect(
      component.addEmployeeForm.controls.role.touched,
    ).toBe(true);

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(
      'Full name is required.',
    );

    expect(compiled.textContent).toContain(
      'Email address is required.',
    );

    expect(compiled.textContent).toContain(
      'Department is required.',
    );

    expect(compiled.textContent).toContain(
      'Role is required.',
    );
  });

  it('should add a valid employee to the directory', () => {
    component.openAddEmployee();
    fixture.detectChanges();

    component.addEmployeeForm.setValue({
      name: 'Maya Sen',
      email: 'maya@example.com',
      department: 'Engineering',
      role: 'Frontend Developer',
    });

    expect(component.addEmployeeForm.valid).toBe(true);

    component.saveEmployee();
    fixture.detectChanges();

    expect(component.isAddEmployeeOpen()).toBe(false);
    expect(component.filteredEmployees().length).toBe(7);

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Maya Sen');
    expect(compiled.textContent).toContain('maya@example.com');
    expect(compiled.textContent).toContain('Frontend Developer');

    expect(
      component.addEmployeeForm.controls.name.value,
    ).toBe('');

    expect(
      component.addEmployeeForm.controls.email.value,
    ).toBe('');

    expect(
      component.addEmployeeForm.controls.department.value,
    ).toBe('');

    expect(
      component.addEmployeeForm.controls.role.value,
    ).toBe('');
  });
});
