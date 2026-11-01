import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

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
    id: 1,
    employeeId: 10,
    employeeName: 'Maya Sen',
    employeeEmail: 'maya@example.com',
    status: 'NOT_STARTED',
    createdAt: '2026-10-29T10:00:00Z',
    completedAt: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OnboardingService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(OnboardingService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should get all onboardings', () => {
    service.getOnboardings().subscribe((result) => {
      expect(result).toEqual([onboarding]);
    });

    const request = httpTesting.expectOne('/api/onboardings');

    expect(request.request.method).toBe('GET');

    request.flush([onboarding]);
  });

  it('should get one onboarding', () => {
    service.getOnboarding(1).subscribe((result) => {
      expect(result).toEqual(onboarding);
    });

    const request = httpTesting.expectOne('/api/onboardings/1');

    expect(request.request.method).toBe('GET');

    request.flush(onboarding);
  });

  it('should create onboarding for an employee', () => {
    const payload: CreateOnboardingRequest = {
      employeeId: 10,
    };

    service.createOnboarding(payload).subscribe((result) => {
      expect(result).toEqual(onboarding);
    });

    const request = httpTesting.expectOne('/api/onboardings');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush(onboarding);
  });

  it('should update onboarding status', () => {
    const payload: UpdateOnboardingStatusRequest = {
      status: 'IN_PROGRESS',
    };

    service.updateOnboardingStatus(1, payload).subscribe();

    const request = httpTesting.expectOne('/api/onboardings/1/status');

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);

    request.flush({
      ...onboarding,
      status: 'IN_PROGRESS',
    });
  });
});
