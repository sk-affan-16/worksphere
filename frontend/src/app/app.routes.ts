import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth-guard';
import { roleGuard } from './core/auth/role-guard';
import { AppShell } from './core/layout/app-shell/app-shell';
import { Login } from './features/auth/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { Employees } from './features/employees/employees';
import { Organization } from './features/organization/organization';
import { Onboarding } from './features/onboarding/onboarding';
import { Documents } from './features/documents/documents';
import { Tasks } from './features/tasks/tasks';
import { Workflow } from './features/workflow/workflow';
import { Notifications } from './features/notifications/notifications';
import { NotFound } from './shared/components/not-found/not-found';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: '',
    component: AppShell,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: Dashboard,
      },
      {
        path: 'organization',
        component: Organization,
        canActivate: [
          roleGuard(['ORG_ADMIN']),
        ],
      },
      {
        path: 'employees',
        component: Employees,
        canActivate: [
          roleGuard(['ORG_ADMIN']),
        ],
      },
      {
        path: 'onboarding',
        component: Onboarding,
      },
      {
        path: 'documents',
        component: Documents,
      },
      {
        path: 'tasks',
        component: Tasks,
      },
      {
        path: 'workflow',
        component: Workflow,
      },
      {
        path: 'notifications',
        component: Notifications,
      },
    ],
  },
  {
    path: '**',
    component: NotFound,
  },
];