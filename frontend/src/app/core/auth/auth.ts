import { Injectable, signal } from '@angular/core';

import { TokenStorage } from './token-storage';
import { CurrentUserResponse, UserRole } from './auth-api.service';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly authenticatedState = signal(false);

  private readonly currentUserState =
    signal<CurrentUserResponse | null>(null);

  readonly isAuthenticated = this.authenticatedState.asReadonly();

  readonly currentUser = this.currentUserState.asReadonly();

  constructor(
    private readonly tokenStorage: TokenStorage,
  ) {
    this.authenticatedState.set(this.tokenStorage.hasToken());
  }

  setToken(token: string): void {
    this.tokenStorage.saveToken(token);
    this.authenticatedState.set(true);
    this.currentUserState.set(null);
  }

  setCurrentUser(user: CurrentUserResponse): void {
    this.currentUserState.set(user);
    this.authenticatedState.set(true);
  }

  role(): UserRole | null {
    return this.currentUserState()?.role ?? null;
  }

  logout(): void {
    this.tokenStorage.clearToken();
    this.currentUserState.set(null);
    this.authenticatedState.set(false);
  }
}
