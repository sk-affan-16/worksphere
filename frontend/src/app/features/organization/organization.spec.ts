import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Organization } from './organization';

describe('Organization', () => {
  let component: Organization;
  let fixture: ComponentFixture<Organization>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Organization],
    }).compileComponents();

    fixture = TestBed.createComponent(Organization);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display organization details', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(
      'WorkSphere Technologies',
    );

    expect(compiled.textContent).toContain(
      'Software & Technology',
    );

    expect(compiled.textContent).toContain(
      'admin@worksphere.example',
    );
  });

  it('should toggle edit mode', () => {
    expect(component.isEditing()).toBe(false);

    component.toggleEdit();

    expect(component.isEditing()).toBe(true);

    component.toggleEdit();

    expect(component.isEditing()).toBe(false);
  });
});
