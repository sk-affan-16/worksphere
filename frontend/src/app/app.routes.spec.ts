import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { routes } from './app.routes';
import { AppShell } from './core/layout/app-shell/app-shell';
import { Login } from './features/auth/login/login';
import { Dashboard } from './features/dashboard/dashboard';

describe('app routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
      ],
    });
  });

  it('should define the login route', () => {
    const loginRoute = routes.find(
      (route) => route.path === 'login',
    );

    expect(loginRoute).toBeTruthy();
    expect(loginRoute?.component).toBe(Login);
  });

  it('should define the protected application shell', () => {
    const shellRoute = routes.find(
      (route) =>
        route.path === '' &&
        route.component === AppShell,
    );

    expect(shellRoute).toBeTruthy();
    expect(shellRoute?.canActivate).toBeTruthy();
    expect(shellRoute?.children).toBeTruthy();
  });

  it('should define the dashboard as a protected child route', () => {
    const shellRoute = routes.find(
      (route) =>
        route.path === '' &&
        route.component === AppShell,
    );

    const dashboardRoute = shellRoute?.children?.find(
      (route) => route.path === 'dashboard',
    );

    expect(dashboardRoute).toBeTruthy();
    expect(dashboardRoute?.component).toBe(Dashboard);
  });

  it('should define all main WorkSphere module routes', () => {
    const shellRoute = routes.find(
      (route) =>
        route.path === '' &&
        route.component === AppShell,
    );

    const childPaths =
      shellRoute?.children?.map((route) => route.path) ?? [];

    expect(childPaths).toEqual([
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

  it('should define a wildcard route for unknown pages', () => {
    const wildcardRoute = routes.find(
      (route) => route.path === '**',
    );

    expect(wildcardRoute).toBeTruthy();
  });

  it('should provide the configured routes to Angular Router', () => {
    const router = TestBed.inject(Router);

    expect(router.config).toStrictEqual(routes);
  });
});
