import { Component, signal } from '@angular/core';
import {
  NavigationEnd,
  Router,
} from '@angular/router';
import { filter } from 'rxjs';

import { Auth } from '../../auth/auth';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly currentUrl = signal('');

  constructor(
    private readonly auth: Auth,
    private readonly router: Router,
  ) {
    this.currentUrl.set(this.router.url);

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd,
        ),
      )
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects);
      });
  }

  get pageTitle(): string {
    const path = this.currentUrl().split('?')[0];
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
