import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import {
  OrganizationResponse,
  OrganizationService,
} from './organization.service';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OrganizationService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(OrganizationService);
    httpTesting = TestBed.inject(
      HttpTestingController,
    );
  });

  afterEach(() => {
    httpTesting.verify();
    TestBed.resetTestingModule();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should get the current organization', () => {
    const organization: OrganizationResponse = {
      id: 1,
      name: 'WorkSphere Technologies',
      status: 'ACTIVE',
      createdAt: '2026-10-24T10:00:00Z',
    };

    let receivedOrganization:
      | OrganizationResponse
      | undefined;

    service
      .getCurrentOrganization()
      .subscribe((response) => {
        receivedOrganization = response;
      });

    const request = httpTesting.expectOne(
      '/api/organizations/me',
    );

    expect(request.request.method).toBe('GET');

    request.flush(organization);

    expect(receivedOrganization).toEqual(
      organization,
    );
  });

  it('should update the current organization name', () => {
    const organization: OrganizationResponse = {
      id: 1,
      name: 'Updated WorkSphere',
      status: 'ACTIVE',
      createdAt: '2026-10-24T10:00:00Z',
    };

    let receivedOrganization:
      | OrganizationResponse
      | undefined;

    service
      .updateCurrentOrganization({
        name: 'Updated WorkSphere',
      })
      .subscribe((response) => {
        receivedOrganization = response;
      });

    const request = httpTesting.expectOne(
      '/api/organizations/me',
    );

    expect(request.request.method).toBe('PATCH');

    expect(request.request.body).toEqual({
      name: 'Updated WorkSphere',
    });

    request.flush(organization);

    expect(receivedOrganization).toEqual(
      organization,
    );
  });

  it('should propagate backend errors', () => {
    let receivedStatus: number | undefined;

    service.getCurrentOrganization().subscribe({
      next: () => {
        throw new Error(
          'The request should have failed.',
        );
      },
      error: (error: { status: number }) => {
        receivedStatus = error.status;
      },
    });

    const request = httpTesting.expectOne(
      '/api/organizations/me',
    );

    request.flush(
      {
        code: 'UNAUTHORIZED',
        message: 'Authentication is required',
      },
      {
        status: 401,
        statusText: 'Unauthorized',
      },
    );

    expect(receivedStatus).toBe(401);
  });
});
