import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { Auth } from '../../core/auth/auth';
import {
  EmployeeResponse,
  EmployeeService,
} from '../employees/employee.service';
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
  private readonly auth = inject(Auth);

  readonly isOrgAdmin = this.auth.isOrgAdmin;

  readonly isLoading = signal(true);
  readonly loadError = signal('');
  readonly employeeAccessUnavailable = signal(false);

  readonly organization =
    signal<OrganizationResponse | null>(null);

  readonly employees =
    signal<EmployeeResponse[]>([]);

  readonly stats = computed<DashboardStat[]>(() => {
    const organization = this.organization();

    if (!this.isOrgAdmin()) {
      return [
        {
          label: 'Workspace',
          value: organization?.name ?? '—',
          description:
            'Your current WorkSphere organization',
        },
        {
          label: 'Organization Status',
          value:
            organization?.status === 'ACTIVE'
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
        value: this.employeeAccessUnavailable()
          ? '—'
          : String(employees.length),
        description: this.employeeAccessUnavailable()
          ? 'Employee data is not available for this account'
          : 'Employees in your organization',
      },
      {
        label: 'Active Employees',
        value: this.employeeAccessUnavailable()
          ? '—'
          : String(activeEmployees),
        description: this.employeeAccessUnavailable()
          ? 'Requires employee management access'
          : 'Currently active employees',
      },
      {
        label: 'Disabled Employees',
        value: this.employeeAccessUnavailable()
          ? '—'
          : String(disabledEmployees),
        description: this.employeeAccessUnavailable()
          ? 'Requires employee management access'
          : 'Currently disabled employees',
      },
      {
        label: 'Organization Status',
        value:
          organization?.status === 'ACTIVE'
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

  readonly recentActivities =
    computed<DashboardActivity[]>(() => {
      const organization = this.organization();

      const activities: DashboardActivity[] = [];

      if (organization) {
        activities.push({
          icon: 'O',
          title: 'Organization connected',
          description: `${organization.name} is connected to the dashboard.`,
        });
      }

      if (!this.isOrgAdmin()) {
        activities.push({
          icon: '✓',
          title: 'Workspace ready',
          description:
            'Your WorkSphere workspace is ready for daily work.',
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

      const employees = this.employees();

      if (!this.employeeAccessUnavailable()) {
        activities.push({
          icon: 'E',
          title: 'Employee directory connected',
          description: `${employees.length} employee records loaded from the backend.`,
        });
      } else {
        activities.push({
          icon: '!',
          title: 'Employee data unavailable',
          description:
            'Your account does not have permission to access employee records.',
        });
      }

      if (organization?.status === 'ACTIVE') {
        activities.push({
          icon: '✓',
          title: 'Organization is active',
          description:
            'Your organization is currently active in WorkSphere.',
        });
      }

      return activities;
    });

  readonly quickActions =
    computed<QuickAction[]>(() => {
      if (!this.isOrgAdmin()) {
        return [
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
          {
            label: 'View Notifications',
            route: '/notifications',
          },
        ];
      }

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
    });

  constructor(
    private readonly organizationService: OrganizationService,
    private readonly employeeService: EmployeeService,
  ) {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.loadError.set('');
    this.employeeAccessUnavailable.set(false);

    this.organizationService
      .getCurrentOrganization()
      .subscribe({
        next: (organization) => {
          this.organization.set(organization);

          if (this.isOrgAdmin()) {
            this.loadEmployees();
            return;
          }

          this.employees.set([]);
          this.isLoading.set(false);
        },
        error: (error: unknown) => {
          this.loadError.set(
            this.getErrorMessage(error),
          );
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
        if (
          error instanceof HttpErrorResponse &&
          error.status === 403
        ) {
          this.employeeAccessUnavailable.set(true);
          this.employees.set([]);
          this.isLoading.set(false);
          return;
        }

        this.loadError.set(
          this.getErrorMessage(error),
        );
        this.isLoading.set(false);
      },
    });
  }

  private getErrorMessage(
    error: unknown,
  ): string {
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