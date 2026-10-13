import { TestBed } from '@angular/core/testing';

import {
  OrganizationRecord,
  OrganizationService,
} from './organization.service';

describe('OrganizationService', () => {
  const storageKey = 'worksphere_organization';

  beforeEach(() => {
    localStorage.removeItem(storageKey);

    TestBed.configureTestingModule({
      providers: [OrganizationService],
    });
  });

  afterEach(() => {
    localStorage.removeItem(storageKey);
    TestBed.resetTestingModule();
  });

  it('should create the service', () => {
    const service = TestBed.inject(OrganizationService);

    expect(service).toBeTruthy();
  });

  it('should load the default organization when storage is empty', () => {
    const service = TestBed.inject(OrganizationService);

    expect(service.organizationData().name).toBe(
      'WorkSphere Technologies',
    );

    expect(service.organizationData().code).toBe(
      'WS-ORG-001',
    );

    expect(service.organizationData().employees).toBe(128);
  });

  it('should update the organization data', () => {
    const service = TestBed.inject(OrganizationService);

    service.updateOrganization({
      name: 'WorkSphere Solutions',
      code: 'WS-ORG-002',
      industry: 'Technology Services',
      email: 'contact@worksphere.example',
      phone: '+91 99999 88888',
      address: 'Kolkata, West Bengal, India',
    });

    const organization = service.organizationData();

    expect(organization.name).toBe(
      'WorkSphere Solutions',
    );
    expect(organization.code).toBe('WS-ORG-002');
    expect(organization.industry).toBe(
      'Technology Services',
    );
    expect(organization.email).toBe(
      'contact@worksphere.example',
    );
    expect(organization.phone).toBe(
      '+91 99999 88888',
    );
    expect(organization.address).toBe(
      'Kolkata, West Bengal, India',
    );
    expect(organization.employees).toBe(128);
  });

  it('should persist updated organization data to localStorage', () => {
    const service = TestBed.inject(OrganizationService);

    service.updateOrganization({
      name: 'WorkSphere Solutions',
      code: 'WS-ORG-002',
      industry: 'Technology Services',
      email: 'contact@worksphere.example',
      phone: '+91 99999 88888',
      address: 'Kolkata, West Bengal, India',
    });

    const storedOrganization = JSON.parse(
      localStorage.getItem(storageKey) ?? '{}',
    ) as OrganizationRecord;

    expect(storedOrganization.name).toBe(
      'WorkSphere Solutions',
    );
    expect(storedOrganization.code).toBe(
      'WS-ORG-002',
    );
    expect(storedOrganization.employees).toBe(128);
  });

  it('should load previously stored organization data', () => {
    const storedOrganization: OrganizationRecord = {
      name: 'Stored Organization',
      code: 'STORED-001',
      industry: 'Consulting',
      email: 'stored@example.com',
      phone: '+91 90000 11111',
      address: 'Bengaluru, Karnataka, India',
      employees: 64,
    };

    localStorage.setItem(
      storageKey,
      JSON.stringify(storedOrganization),
    );

    const service = TestBed.inject(OrganizationService);

    expect(service.organizationData()).toEqual(
      storedOrganization,
    );
  });

  it('should fall back to the default organization when stored data is invalid', () => {
    localStorage.setItem(
      storageKey,
      'invalid-json',
    );

    const service = TestBed.inject(OrganizationService);

    expect(service.organizationData().name).toBe(
      'WorkSphere Technologies',
    );

    expect(service.organizationData().employees).toBe(128);
  });
});
