
import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  provideHttpClient,
} from '@angular/common/http';

import {
  CreateOnboardingRequest,
  OnboardingResponse,
  OnboardingService,
  UpdateOnboardingStatusRequest,
} from './onboarding.service';

describe('OnboardingService', () => {
  let service: OnboardingService;
  let httpTesting: HttpTestingController;

  const onboarding: OnboardingResponse = {
    id: 100,
    employeeId: 1,
    employeeName: 'Maya Sen',
    employeeEmail: 'maya@example.com',
    status: 'NOT_STARTED',
    createdAt: '2026-10-01T10:00:00Z',
    completedAt: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OnboardingService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(OnboardingService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve all onboarding records', () => {
    service.getOnboardings().subscribe((records) => {
      expect(records).toEqual([onboarding]);
    });

    const request = httpTesting.expectOne('/api/onboardings');

    expect(request.request.method).toBe('GET');

    request.flush([onboarding]);
  });

  it('should create onboarding for an employee', () => {
    const payload: CreateOnboardingRequest = {
      employeeId: 1,
    };

    service.createOnboarding(payload).subscribe((result) => {
      expect(result).toEqual(onboarding);
    });

    const request = httpTesting.expectOne('/api/onboardings');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush(onboarding);
  });

  it('should retrieve one onboarding record', () => {
    service.getOnboarding(100).subscribe((result) => {
      expect(result).toEqual(onboarding);
    });

    const request = httpTesting.expectOne(
      '/api/onboardings/100',
    );

    expect(request.request.method).toBe('GET');

    request.flush(onboarding);
  });

  it('should update onboarding status', () => {
    const payload: UpdateOnboardingStatusRequest = {
      status: 'IN_PROGRESS',
    };

    const updatedOnboarding: OnboardingResponse = {
      ...onboarding,
      status: 'IN_PROGRESS',
    };

    service.updateOnboardingStatus(100, payload).subscribe(
      (result) => {
        expect(result).toEqual(updatedOnboarding);
      },
    );

    const request = httpTesting.expectOne(
      '/api/onboardings/100/status',
    );

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);

    request.flush(updatedOnboarding);
  });
});
