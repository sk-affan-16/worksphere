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

  it('should display organization contact and location details', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(
      '+91 98765 43210',
    );

    expect(compiled.textContent).toContain(
      'Bhubaneswar, Odisha, India',
    );
  });

  it('should display the employee count', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('128');
  });

  it('should toggle edit mode', () => {
    expect(component.isEditing()).toBe(false);

    component.toggleEdit();

    expect(component.isEditing()).toBe(true);

    component.toggleEdit();

    expect(component.isEditing()).toBe(false);
  });

  it('should provide an accessible name for the organization details card', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const card = compiled.querySelector('.organization-card');
    const heading = compiled.querySelector(
      '#organization-details-title',
    );

    expect(heading?.textContent?.trim()).toBe(
      'Organization Details',
    );

    expect(
      card?.getAttribute('aria-labelledby'),
    ).toBe('organization-details-title');
  });

  it('should expose the edit button state accessibly', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const button = compiled.querySelector(
      '.primary-button',
    ) as HTMLButtonElement;

    expect(
      button.getAttribute('aria-label'),
    ).toBe('Edit organization');

    expect(
      button.getAttribute('aria-pressed'),
    ).toBe('false');

    component.toggleEdit();
    fixture.detectChanges();

    expect(
      button.getAttribute('aria-label'),
    ).toBe('Cancel organization editing');

    expect(
      button.getAttribute('aria-pressed'),
    ).toBe('true');
  });

  it('should display the organization edit form when editing', () => {
    component.startEditing();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    const form = compiled.querySelector(
      '.organization-form',
    );

    expect(form).toBeTruthy();

    expect(
      form?.getAttribute('aria-labelledby'),
    ).toBe('organization-edit-title');

    expect(
      compiled.querySelector('#organization-name'),
    ).toBeTruthy();

    expect(
      compiled.querySelector('#organization-code'),
    ).toBeTruthy();

    expect(
      compiled.querySelector('#organization-industry'),
    ).toBeTruthy();

    expect(
      compiled.querySelector('#organization-email'),
    ).toBeTruthy();

    expect(
      compiled.querySelector('#organization-phone'),
    ).toBeTruthy();

    expect(
      compiled.querySelector('#organization-address'),
    ).toBeTruthy();
  });

  it('should validate required organization fields when saving an empty form', () => {
    component.startEditing();
    fixture.detectChanges();

    component.organizationForm.patchValue({
      name: '',
      code: '',
      industry: '',
      email: '',
      phone: '',
      address: '',
    });

    component.saveOrganization();
    fixture.detectChanges();

    expect(
      component.editSubmitted(),
    ).toBe(true);

    expect(
      component.organizationForm.controls.name.touched,
    ).toBe(true);

    expect(
      component.organizationForm.controls.code.touched,
    ).toBe(true);

    expect(
      component.organizationForm.controls.industry.touched,
    ).toBe(true);

    expect(
      component.organizationForm.controls.email.touched,
    ).toBe(true);

    expect(
      component.organizationForm.controls.phone.touched,
    ).toBe(true);

    expect(
      component.organizationForm.controls.address.touched,
    ).toBe(true);

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(
      'Organization name is required.',
    );

    expect(compiled.textContent).toContain(
      'Organization code is required.',
    );

    expect(compiled.textContent).toContain(
      'Industry is required.',
    );

    expect(compiled.textContent).toContain(
      'Contact email is required.',
    );

    expect(compiled.textContent).toContain(
      'Contact phone is required.',
    );

    expect(compiled.textContent).toContain(
      'Address is required.',
    );
  });

  it('should save valid organization changes', () => {
    component.startEditing();
    fixture.detectChanges();

    component.organizationForm.setValue({
      name: 'WorkSphere Solutions',
      code: 'WS-ORG-002',
      industry: 'Technology Services',
      email: 'contact@worksphere.example',
      phone: '+91 99999 88888',
      address: 'Kolkata, West Bengal, India',
    });

    expect(
      component.organizationForm.valid,
    ).toBe(true);

    component.saveOrganization();
    fixture.detectChanges();

    expect(component.isEditing()).toBe(false);
    expect(component.editSubmitted()).toBe(false);

    expect(component.organization.name).toBe(
      'WorkSphere Solutions',
    );

    expect(component.organization.code).toBe(
      'WS-ORG-002',
    );

    expect(component.organization.industry).toBe(
      'Technology Services',
    );

    expect(component.organization.email).toBe(
      'contact@worksphere.example',
    );

    expect(component.organization.phone).toBe(
      '+91 99999 88888',
    );

    expect(component.organization.address).toBe(
      'Kolkata, West Bengal, India',
    );

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(
      'WorkSphere Solutions',
    );

    expect(compiled.textContent).toContain(
      'WS-ORG-002',
    );

    expect(compiled.textContent).toContain(
      'Technology Services',
    );

    expect(compiled.textContent).toContain(
      'contact@worksphere.example',
    );

    expect(compiled.textContent).toContain(
      'Kolkata, West Bengal, India',
    );
  });
});
