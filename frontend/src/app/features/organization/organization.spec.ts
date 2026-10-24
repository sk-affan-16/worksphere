import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import {
  OrganizationResponse,
  OrganizationService,
} from './organization.service';
import { Organization } from './organization';

describe('Organization', () => {
  let component: Organization;
  let fixture: ComponentFixture<Organization>;

  let organizationService: {
    getCurrentOrganization: ReturnType<typeof vi.fn>;
    updateCurrentOrganization: ReturnType<typeof vi.fn>;
  };

  const organization: OrganizationResponse = {
    id: 1,
    name: 'WorkSphere Technologies',
    status: 'ACTIVE',
    createdAt: '2026-10-24T10:00:00Z',
  };

  beforeEach(async () => {
    organizationService = {
      getCurrentOrganization: vi
        .fn()
        .mockReturnValue(of(organization)),
      updateCurrentOrganization: vi
        .fn()
        .mockReturnValue(of(organization)),
    };

    await TestBed.configureTestingModule({
      imports: [Organization],
      providers: [
        {
          provide: OrganizationService,
          useValue: organizationService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Organization);
    component = fixture.componentInstance;

    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load organization from the API', () => {
    expect(
      organizationService.getCurrentOrganization,
    ).toHaveBeenCalled();

    expect(component.organization()).toEqual(
      organization,
    );

    expect(component.isLoading()).toBe(false);
    expect(component.loadError()).toBe('');
  });

  it('should display organization details from the API', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(
      'WorkSphere Technologies',
    );

    expect(compiled.textContent).toContain(
      'ACTIVE',
    );

    expect(compiled.textContent).toContain('1');
  });

  it('should display the creation date', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(
      'Oct 24, 2026',
    );
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

    const card = compiled.querySelector(
      '.organization-card',
    );

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
      compiled.querySelector('#organization-name'),
    ).toBeTruthy();

    expect(
      form?.getAttribute('aria-labelledby'),
    ).toBe('organization-edit-title');
  });

  it('should validate the organization name when saving an empty form', () => {
    component.startEditing();

    component.organizationForm.patchValue({
      name: '',
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
      organizationService.updateCurrentOrganization,
    ).not.toHaveBeenCalled();

    expect(fixture.nativeElement.textContent).toContain(
      'Organization name is required.',
    );
  });

  it('should update the organization through the API', () => {
    const updatedOrganization: OrganizationResponse = {
      ...organization,
      name: 'WorkSphere Solutions',
    };

    organizationService.updateCurrentOrganization.mockReturnValue(
      of(updatedOrganization),
    );

    component.startEditing();

    component.organizationForm.setValue({
      name: 'WorkSphere Solutions',
    });

    component.saveOrganization();
    fixture.detectChanges();

    expect(
      organizationService.updateCurrentOrganization,
    ).toHaveBeenCalledWith({
      name: 'WorkSphere Solutions',
    });

    expect(component.organization()).toEqual(
      updatedOrganization,
    );

    expect(component.isEditing()).toBe(false);
    expect(component.isSaving()).toBe(false);
    expect(component.editSubmitted()).toBe(false);

    expect(component.organizationForm.controls.name.value).toBe(
      'WorkSphere Solutions',
    );
  });

  it('should display the backend error when loading fails', () => {
    organizationService.getCurrentOrganization.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 401,
            statusText: 'Unauthorized',
            error: {
              code: 'UNAUTHORIZED',
              message: 'Authentication is required',
            },
          }),
      ),
    );

    fixture = TestBed.createComponent(Organization);
    component = fixture.componentInstance;

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.isLoading()).toBe(false);
    expect(component.loadError()).toBe(
      'Authentication is required',
    );
  });

  it('should display the backend error when updating fails', () => {
    organizationService.updateCurrentOrganization.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 403,
            statusText: 'Forbidden',
            error: {
              code: 'FORBIDDEN',
              message: 'Access denied',
            },
          }),
      ),
    );

    component.startEditing();

    component.organizationForm.setValue({
      name: 'New Organization Name',
    });

    component.saveOrganization();
    fixture.detectChanges();

    expect(component.saveError()).toBe(
      'Access denied',
    );

    expect(component.isSaving()).toBe(false);
    expect(component.isEditing()).toBe(true);
  });
});
