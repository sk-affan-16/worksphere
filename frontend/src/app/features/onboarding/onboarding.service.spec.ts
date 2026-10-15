import { TestBed } from '@angular/core/testing';

import {
  OnboardingRecord,
  OnboardingService,
} from './onboarding.service';

describe('OnboardingService', () => {
  const storageKey = 'worksphere_onboarding';

  beforeEach(() => {
    localStorage.removeItem(storageKey);

    TestBed.configureTestingModule({
      providers: [OnboardingService],
    });
  });

  afterEach(() => {
    localStorage.removeItem(storageKey);
    TestBed.resetTestingModule();
  });

  it('should create the service', () => {
    const service = TestBed.inject(OnboardingService);

    expect(service).toBeTruthy();
  });

  it('should load the default onboarding records when storage is empty', () => {
    const service = TestBed.inject(OnboardingService);

    expect(service.onboardingList().length).toBe(4);
  });

  it('should add an onboarding record', () => {
    const service = TestBed.inject(OnboardingService);

    const newRecord: OnboardingRecord = {
      employee: 'Maya Sen',
      department: 'Engineering',
      startDate: '2026-10-13',
      progress: 0,
      status: 'Not Started',
    };

    service.addOnboarding(newRecord);

    expect(service.onboardingList().length).toBe(5);
    expect(service.onboardingList()[4]).toEqual(
      newRecord,
    );
  });

  it('should persist a newly added onboarding record to localStorage', () => {
    const service = TestBed.inject(OnboardingService);

    const newRecord: OnboardingRecord = {
      employee: 'Maya Sen',
      department: 'Engineering',
      startDate: '2026-10-13',
      progress: 0,
      status: 'Not Started',
    };

    service.addOnboarding(newRecord);

    const storedRecords = JSON.parse(
      localStorage.getItem(storageKey) ?? '[]',
    ) as OnboardingRecord[];

    expect(storedRecords.length).toBe(5);
    expect(storedRecords[4]).toEqual(newRecord);
  });

  it('should load previously stored onboarding records', () => {
    const storedRecords: OnboardingRecord[] = [
      {
        employee: 'Stored Employee',
        department: 'Operations',
        startDate: '2026-10-15',
        progress: 50,
        status: 'In Progress',
      },
    ];

    localStorage.setItem(
      storageKey,
      JSON.stringify(storedRecords),
    );

    const service = TestBed.inject(OnboardingService);

    expect(service.onboardingList()).toEqual(
      storedRecords,
    );
  });

  it('should fall back to default onboarding records when stored data is invalid', () => {
    localStorage.setItem(
      storageKey,
      'invalid-json',
    );

    const service = TestBed.inject(OnboardingService);

    expect(service.onboardingList().length).toBe(4);
  });
});
