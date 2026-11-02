
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { Auth } from '../../auth/auth';
import { AuthApiService } from '../../auth/auth-api.service';
import { Navbar } from '../navbar/navbar';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-app-shell',
  imports: [RouterOutlet, Sidebar, Navbar],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css',
})
export class AppShell implements OnInit {
  constructor(
    private readonly auth: Auth,
    private readonly authApi: AuthApiService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    // Do not make an API call if the user is not authenticated.
    if (!this.auth.isAuthenticated()) {
      return;
    }

    // The role is already available. No duplicate profile request is needed.
    if (this.auth.currentUser()) {
      return;
    }

    // Restore the authenticated user's role and profile after browser refresh.
    this.authApi.getCurrentUser().subscribe({
      next: (user) => {
        this.auth.setCurrentUser(user);
      },
      error: (error: unknown) => {
        if (
          error instanceof HttpErrorResponse &&
          error.status === 401
        ) {
          // An expired or invalid token must not remain authenticated.
          this.auth.logout();
          void this.router.navigate(['/login']);
          return;
        }

        // A temporary server/network failure should not erase a valid token.
        console.error(
          'Unable to load the authenticated user profile.',
          error,
        );
      },
    });
  }
}
