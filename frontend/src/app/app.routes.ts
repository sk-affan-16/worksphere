import { Routes } from '@angular/router';

import { AppShell } from './core/layout/app-shell/app-shell';
import { Dashboard } from './features/dashboard/dashboard';
import { Login } from './features/auth/login/login';
import { authGuard } from './core/auth/auth-guard';

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
    children: [
      {
        path: 'dashboard',
        component: Dashboard,
        canActivate: [authGuard],
      },
    ],
  },
];
