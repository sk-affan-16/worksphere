import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Auth } from '../../auth/auth';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  constructor(
    private readonly auth: Auth,
    private readonly router: Router,
  ) {}

  get pageTitle(): string {
    const path = this.router.url.split('?')[0];
    const segment = path.split('/')[1];

    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      organization: 'Organization',
      employees: 'Employees',
      onboarding: 'Onboarding',
      documents: 'Documents',
      tasks: 'Tasks',
      workflow: 'Workflow',
      notifications: 'Notifications',
    };

    return titles[segment] ?? 'WorkSphere';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  openNotifications(): void {
    this.router.navigate(['/notifications']);
  }
}
