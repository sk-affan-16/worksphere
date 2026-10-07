import { Routes } from '@angular/router';

import { AppShell } from './core/layout/app-shell/app-shell';
import { authGuard } from './core/auth/auth-guard';
import { Login } from './features/auth/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { ModulePlaceholder } from './shared/components/module-placeholder/module-placeholder';

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
        component: ModulePlaceholder,
        data: { title: 'Organization' },
      },
      {
        path: 'employees',
        component: ModulePlaceholder,
        data: { title: 'Employees' },
      },
      {
        path: 'onboarding',
        component: ModulePlaceholder,
        data: { title: 'Onboarding' },
      },
      {
        path: 'documents',
        component: ModulePlaceholder,
        data: { title: 'Documents' },
      },
      {
        path: 'tasks',
        component: ModulePlaceholder,
        data: { title: 'Tasks' },
      },
      {
        path: 'workflow',
        component: ModulePlaceholder,
        data: { title: 'Workflow' },
      },
      {
        path: 'notifications',
        component: ModulePlaceholder,
        data: { title: 'Notifications' },
      },
    ],
  },
];
