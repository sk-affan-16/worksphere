
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Auth } from '../../core/auth/auth';
import { EmployeeResponse, EmployeeService } from '../employees/employee.service';
import {
  OrganizationResponse,
  OrganizationService,
} from '../organization/organization.service';

interface DashboardStat {
  label: string;
  value: string;
  description: string;
}

interface DashboardActivity {
  icon: string;
  title: string;
  description: string;
}

interface QuickAction {
  label: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  readonly isLoading = signal(true);
  readonly loadError = signal('');

  readonly organization = signal<OrganizationResponse | null>(null);
  readonly employees = signal<EmployeeResponse[]>([]);

  // The route guard loads the authenticated user's role before this
  // component is activated.
  readonly isAdmin = computed(
    () => this.auth.role() === 'ORG_ADMIN',
  );

  readonly stats = computed<DashboardStat[]>(() => {
    const organization = this.organization();

    if (this.isAdmin()) {
      const employees = this.employees();

      const activeEmployees = employees.filter(
        (employee) => employee.status === 'ACTIVE',
      ).length;

      const disabledEmployees = employees.filter(
        (employee) => employee.status === 'DISABLED',
      ).length;

      return [
        {
          label: 'Total Employees',
          value: String(employees.length),
          description: 'Employees in your organization',
        },
        {
          label: 'Active Employees',
          value: String(activeEmployees),
          description: 'Currently active employees',
        },
        {
          label: 'Disabled Employees',
          value: String(disabledEmployees),
          description: 'Currently disabled employees',
        },
        {
          label: 'Organization Status',
          value: organization?.status === 'ACTIVE'
            ? 'Active'
            : organization?.status === 'INACTIVE'
              ? 'Inactive'
              : '—',
          description: organization
            ? organization.name
            : 'Organization information unavailable',
        },
      ];
    }

    // Employees must not see organization-wide employee statistics.
    return [
      {
        label: 'Your Role',
        value: 'Employee',
        description: 'Your WorkSphere access level',
      },
      {
        label: 'Organization Status',
        value: organization?.status === 'ACTIVE'
          ? 'Active'
          : organization?.status === 'INACTIVE'
            ? 'Inactive'
            : '—',
        description: organization
          ? organization.name
          : 'Organization information unavailable',
      },
    ];
  });

  readonly recentActivities = computed<DashboardActivity[]>(() => {
    const organization = this.organization();

    if (this.isAdmin()) {
      const employees = this.employees();
      const activities: DashboardActivity[] = [];

      if (organization) {
        activities.push({
          icon: 'O',
          title: 'Organization connected',
          description: `${organization.name} is connected to the dashboard.`,
        });
      }

      activities.push({
        icon: 'E',
        title: 'Employee directory connected',
        description: `${employees.length} employee records loaded from the backend.`,
      });

      if (organization?.status === 'ACTIVE') {
        activities.push({
          icon: '✓',
          title: 'Organization is active',
          description:
            'Your organization is currently active in WorkSphere.',
        });
      }

      return activities;
    }

    const activities: DashboardActivity[] = [];

    if (organization) {
      activities.push({
        icon: 'O',
        title: 'Organization connected',
        description: `${organization.name} is connected to your workspace.`,
      });
    }

    activities.push({
      icon: '✓',
      title: 'Your workspace is ready',
      description:
        'Open Tasks to review and update work assigned to you.',
    });

    return activities;
  });

  readonly quickActions = computed<QuickAction[]>(() => {
    if (this.isAdmin()) {
      return [
        {
          label: 'Manage Employees',
          route: '/employees',
        },
        {
          label: 'View Tasks',
          route: '/tasks',
        },
        {
          label: 'Review Onboarding',
          route: '/onboarding',
        },
        {
          label: 'View Documents',
          route: '/documents',
        },
      ];
    }

    // Employee actions must not include employee or organization management.
    return [
      {
        label: 'View My Tasks',
        route: '/tasks',
      },
      {
        label: 'View Documents',
        route: '/documents',
      },
      {
        label: 'Notifications',
        route: '/notifications',
      },
    ];
  });

  constructor(
    private readonly auth: Auth,
    private readonly organizationService: OrganizationService,
    private readonly employeeService: EmployeeService,
  ) {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.loadError.set('');
    this.employees.set([]);

    // This endpoint is available to both authenticated roles.
    this.organizationService.getCurrentOrganization().subscribe({
      next: (organization) => {
        this.organization.set(organization);

        // Only administrators are allowed to request the employee directory.
        if (this.isAdmin()) {
          this.loadEmployees();
          return;
        }

        // Employee dashboard does not call the organization-wide employee API.
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.loadError.set(this.getErrorMessage(error));
        this.isLoading.set(false);
      },
    });
  }

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

  private loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees.set(employees);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.loadError.set(this.getErrorMessage(error));
        this.isLoading.set(false);
      },
    });
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const backendMessage = error.error?.message;

      if (
        typeof backendMessage === 'string' &&
        backendMessage.trim()
      ) {
        return backendMessage;
      }

      if (error.status === 401) {
        return 'Your session has expired. Please log in again.';
      }

      if (error.status === 403) {
        return 'You are not authorized to access this information.';
      }

      if (error.status >= 500) {
        return 'The server could not load dashboard data. Please try again.';
      }
    }

    return 'Unable to load dashboard data. Please try again.';
  }
}
