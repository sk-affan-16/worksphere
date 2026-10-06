import { Injectable, signal } from '@angular/core';

import { TokenStorage } from './token-storage';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly authenticatedState = signal(false);

  readonly isAuthenticated = this.authenticatedState.asReadonly();

  constructor(private readonly tokenStorage: TokenStorage) {
    this.authenticatedState.set(this.tokenStorage.hasToken());
  }

  setToken(token: string): void {
    this.tokenStorage.saveToken(token);
    this.authenticatedState.set(true);
  }

  logout(): void {
    this.tokenStorage.clearToken();
    this.authenticatedState.set(false);
  }
}
