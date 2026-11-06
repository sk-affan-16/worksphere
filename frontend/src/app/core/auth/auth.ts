import { Injectable, signal } from '@angular/core';
import {
  Observable,
  of,
  throwError,
} from 'rxjs';
import {
  catchError,
  finalize,
  shareReplay,
  tap,
} from 'rxjs';

import {
  AuthApiService,
  CurrentUserResponse,
  UserRole,
} from './auth-api.service';
import { TokenStorage } from './token-storage';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly authenticatedState = signal(false);
  private readonly currentUserState =
    signal<CurrentUserResponse | null>(null);

  private currentUserRequest:
    Observable<CurrentUserResponse> | null = null;

  readonly isAuthenticated =
    this.authenticatedState.asReadonly();

  readonly currentUser =
    this.currentUserState.asReadonly();

  constructor(
    private readonly tokenStorage: TokenStorage,
    private readonly authApiService: AuthApiService,
  ) {
    this.authenticatedState.set(
      this.tokenStorage.hasToken(),
    );
  }

  setToken(token: string): void {
    this.tokenStorage.saveToken(token);
    this.currentUserState.set(null);
    this.currentUserRequest = null;
    this.authenticatedState.set(true);
  }

  loadCurrentUser(): Observable<CurrentUserResponse> {
    if (!this.tokenStorage.hasToken()) {
      this.logout();
      return throwError(
        () => new Error('Authentication required'),
      );
    }

    const existingUser = this.currentUserState();

    if (existingUser) {
      return of(existingUser);
    }

    if (this.currentUserRequest) {
      return this.currentUserRequest;
    }

    this.currentUserRequest =
      this.authApiService.getCurrentUser().pipe(
        tap((user) => {
          this.currentUserState.set(user);
          this.authenticatedState.set(true);
        }),
        catchError((error: unknown) => {
          this.logout();
          return throwError(() => error);
        }),
        finalize(() => {
          this.currentUserRequest = null;
        }),
        shareReplay(1),
      );

    return this.currentUserRequest;
  }

  hasRole(role: UserRole): boolean {
    return this.currentUser()?.role === role;
  }

  logout(): void {
    this.tokenStorage.clearToken();
    this.currentUserState.set(null);
    this.currentUserRequest = null;
    this.authenticatedState.set(false);
  }
}
