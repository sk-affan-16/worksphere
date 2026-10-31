import {
  Component,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';

import { Auth } from '../../auth/auth';
import { AuthApiService } from '../../auth/auth-api.service';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnDestroy {
  private readonly currentUrl = signal('');
  private readonly photoUrl = signal<string | null>(null);

  private routerSubscription?: Subscription;
  private photoSubscription?: Subscription;

  constructor(
    private readonly auth: Auth,
    private readonly authApi: AuthApiService,
    private readonly router: Router,
  ) {
    this.currentUrl.set(this.router.url);
  }

  ngOnInit(): void {
    this.routerSubscription = this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd,
        ),
      )
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects);
      });

    if (this.auth.isAuthenticated()) {
      this.loadProfilePhoto();
    }
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
    this.photoSubscription?.unsubscribe();

    const currentPhotoUrl = this.photoUrl();

    if (currentPhotoUrl) {
      URL.revokeObjectURL(currentPhotoUrl);
    }
  }

  private loadProfilePhoto(): void {
    this.photoSubscription = this.authApi
      .getProfilePhoto()
      .subscribe({
        next: (photoBlob: Blob) => {
          if (!photoBlob || photoBlob.size === 0) {
            return;
          }

          const previousPhotoUrl = this.photoUrl();

          if (previousPhotoUrl) {
            URL.revokeObjectURL(previousPhotoUrl);
          }

          const newPhotoUrl = URL.createObjectURL(photoBlob);
          this.photoUrl.set(newPhotoUrl);
        },
        error: (error) => {
          // Keep displaying the user's initial if no photo is available.
          console.warn(
            'Unable to load the profile photo.',
            error,
          );
        },
      });
  }

  get profilePhotoUrl(): string | null {
    return this.photoUrl();
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

  get displayName(): string {
    const user = this.auth.currentUser();

    if (user?.firstName?.trim()) {
      return user.firstName.trim();
    }

    if (user?.email) {
      const emailName = user.email.split('@')[0];

      if (emailName) {
        return emailName;
      }
    }

    return 'User';
  }

  get avatarInitial(): string {
    return this.displayName.charAt(0).toUpperCase();
  }

  get displayRole(): string {
    const role = this.auth.currentUser()?.role;

    if (role === 'ORG_ADMIN') {
      return 'Administrator';
    }

    if (role === 'EMPLOYEE') {
      return 'Employee';
    }

    return 'User';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  openNotifications(): void {
    this.router.navigate(['/notifications']);
  }
}
