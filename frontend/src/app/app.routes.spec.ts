import { TestBed } from '@angular/core/testing';

import { AppShell } from './core/layout/app-shell/app-shell';
import { authGuard } from './core/auth/auth-guard';
import { Dashboard } from './features/dashboard/dashboard';
import { Documents } from './features/documents/documents';
import { Employees } from './features/employees/employees';
import { Notifications } from './features/notifications/notifications';
import { Onboarding } from './features/onboarding/onboarding';
import { Organization } from './features/organization/organization';
import { Tasks } from './features/tasks/tasks';
import { Workflow } from './features/workflow/workflow';
import { Login } from './features/auth/login/login';
import { routes } from './app.routes';

describe('Application routes', () => {
  const shellRoute = routes.find(
    (route) => route.component === AppShell,
  );

  const childRoutes = shellRoute?.children ?? [];

  const findChildRoute = (path: string) => {
    return childRoutes.find(
      (route) => route.path === path,
    );
  };

  it('should have a public login route', () => {
    const loginRoute = routes.find(
      (route) => route.path === 'login',
    );

    expect(loginRoute?.component).toBe(Login);
  });

  it('should protect the application shell with the auth guard', () => {
    expect(shellRoute).toBeTruthy();
    expect(shellRoute?.canActivate).toEqual([
      authGuard,
    ]);
  });

  it('should map all main feature routes to the correct components', () => {
    expect(findChildRoute('dashboard')?.component).toBe(
      Dashboard,
    );

    expect(findChildRoute('organization')?.component).toBe(
      Organization,
    );

    expect(findChildRoute('employees')?.component).toBe(
      Employees,
    );

    expect(findChildRoute('onboarding')?.component).toBe(
      Onboarding,
    );

    expect(findChildRoute('documents')?.component).toBe(
      Documents,
    );

    expect(findChildRoute('tasks')?.component).toBe(
      Tasks,
    );

    expect(findChildRoute('workflow')?.component).toBe(
      Workflow,
    );

    expect(findChildRoute('notifications')?.component).toBe(
      Notifications,
    );
  });

  it('should have all eight main feature routes', () => {
    const featurePaths = childRoutes
      .filter((route) => route.path)
      .map((route) => route.path);

    expect(featurePaths).toEqual([
      'dashboard',
      'organization',
      'employees',
      'onboarding',
      'documents',
      'tasks',
      'workflow',
      'notifications',
    ]);
  });

  it('should have a wildcard not-found route', () => {
    const wildcardRoute = routes.find(
      (route) => route.path === '**',
    );

    expect(wildcardRoute).toBeTruthy();
  });
});
