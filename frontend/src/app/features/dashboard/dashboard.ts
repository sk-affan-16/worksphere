import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface DashboardStat {
  label: string;
  value: number;
  description: string;
}

interface DashboardActivity {
  icon: string;
  title: string;
  description: string;
}

interface QuickAction {
  label: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  /*
   * Temporary frontend demo data.
   * This is not the backend dashboard API contract.
   */
  readonly stats: DashboardStat[] = [
    {
      label: 'Total Employees',
      value: 128,
      description: 'Active employees',
    },
    {
      label: 'Active Tasks',
      value: 24,
      description: 'Tasks currently in progress',
    },
    {
      label: 'Pending Onboarding',
      value: 8,
      description: 'Employees awaiting completion',
    },
    {
      label: 'Documents',
      value: 342,
      description: 'Organization documents',
    },
  ];

  readonly recentActivities: DashboardActivity[] = [
    {
      icon: '+',
      title: 'New employee added',
      description: 'Employee record created recently.',
    },
    {
      icon: '✓',
      title: 'Task completed',
      description: 'Employee onboarding task completed.',
    },
    {
      icon: 'D',
      title: 'Document uploaded',
      description: 'A new employee document was uploaded.',
    },
  ];

  readonly quickActions: QuickAction[] = [
    {
      label: 'Manage Employees',
    },
    {
      label: 'View Tasks',
    },
    {
      label: 'Review Onboarding',
    },
    {
      label: 'View Documents',
    },
  ];

  protected trackStat(
    _index: number,
    stat: DashboardStat,
  ): string {
    return stat.label;
  }

  protected trackActivity(
    _index: number,
    activity: DashboardActivity,
  ): string {
    return activity.title;
  }

  protected trackQuickAction(
    _index: number,
    action: QuickAction,
  ): string {
    return action.label;
  }
}
