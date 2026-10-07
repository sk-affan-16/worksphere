import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { EmptyState } from '../../shared/components/empty-state/empty-state';

type OnboardingStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Completed';

interface DemoOnboarding {
  employee: string;
  department: string;
  startDate: string;
  progress: number;
  status: OnboardingStatus;
}

@Component({
  selector: 'app-onboarding',
  imports: [FormsModule, EmptyState],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.css',
})
export class Onboarding {
  readonly searchTerm = signal('');
  readonly statusFilter = signal<'All' | OnboardingStatus>('All');

  /*
   * Temporary frontend demo data.
   * This is not the backend onboarding API contract.
   */
  private readonly demoOnboarding: DemoOnboarding[] = [
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

  readonly filteredOnboarding = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.demoOnboarding.filter((item) => {
      const matchesSearch =
        !search ||
        item.employee.toLowerCase().includes(search) ||
        item.department.toLowerCase().includes(search);

      const matchesStatus =
        status === 'All' || item.status === status;

      return matchesSearch && matchesStatus;
    });
  });

  updateSearch(value: string): void {
    this.searchTerm.set(value);
  }

  updateStatus(value: string): void {
    if (
      value === 'All' ||
      value === 'Not Started' ||
      value === 'In Progress' ||
      value === 'Completed'
    ) {
      this.statusFilter.set(value);
    }
  }

  protected trackOnboarding(
    _index: number,
    item: DemoOnboarding,
  ): string {
    return item.employee;
  }
}
