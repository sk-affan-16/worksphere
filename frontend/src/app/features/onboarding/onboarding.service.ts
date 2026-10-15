import { Injectable, signal } from '@angular/core';

export type OnboardingStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Completed';

export interface OnboardingRecord {
  employee: string;
  department: string;
  startDate: string;
  progress: number;
  status: OnboardingStatus;
}

@Injectable({
  providedIn: 'root',
})
export class OnboardingService {
  private readonly storageKey =
    'worksphere_onboarding';

  private readonly onboarding =
    signal<OnboardingRecord[]>(
      this.loadOnboarding(),
    );

  readonly onboardingList =
    this.onboarding.asReadonly();

  addOnboarding(
    record: OnboardingRecord,
  ): void {
    this.onboarding.update((records) => {
      const updatedRecords = [...records, record];

      this.saveOnboarding(updatedRecords);

      return updatedRecords;
    });
  }

  private loadOnboarding(): OnboardingRecord[] {
    const storedOnboarding = localStorage.getItem(
      this.storageKey,
    );

    if (!storedOnboarding) {
      return this.getDefaultOnboarding();
    }

    try {
      const parsedOnboarding = JSON.parse(
        storedOnboarding,
      );

      if (Array.isArray(parsedOnboarding)) {
        return parsedOnboarding as OnboardingRecord[];
      }
    } catch {
      // Fall back to the default demo data.
    }

    return this.getDefaultOnboarding();
  }

  private saveOnboarding(
    records: OnboardingRecord[],
  ): void {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify(records),
    );
  }

  private getDefaultOnboarding(): OnboardingRecord[] {
    return [
      {
        employee: 'Aarav Sharma',
        department: 'Engineering',
        startDate: '2026-09-15',
        progress: 100,
        status: 'Completed',
      },
      {
        employee: 'Priya Das',
        department: 'Human Resources',
        startDate: '2026-09-22',
        progress: 75,
        status: 'In Progress',
      },
      {
        employee: 'Rahul Verma',
        department: 'Finance',
        startDate: '2026-09-29',
        progress: 50,
        status: 'In Progress',
      },
      {
        employee: 'Sneha Patel',
        department: 'Operations',
        startDate: '2026-10-06',
        progress: 20,
        status: 'Not Started',
      },
    ];
  }
}
