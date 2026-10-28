import {
  Injectable,
  computed,
  signal,
} from '@angular/core';
import { Observable, tap } from 'rxjs';

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
  private readonly authenticatedState =
    signal(false);

  private readonly currentUserState =
    signal<CurrentUserResponse | null>(null);

  readonly isAuthenticated =
    this.authenticatedState.asReadonly();

  readonly currentUser =
    this.currentUserState.asReadonly();

  readonly role = computed<UserRole | null>(
    () => this.currentUser()?.role ?? null,
  );

  readonly isOrgAdmin = computed(
    () => this.role() === 'ORG_ADMIN',
  );

  readonly isEmployee = computed(
    () => this.role() === 'EMPLOYEE',
  );

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
    this.authenticatedState.set(true);
  }

  loadCurrentUser(): Observable<CurrentUserResponse> {
    return this.authApiService
      .getCurrentUser()
      .pipe(
        tap((currentUser) => {
          this.currentUserState.set(
            currentUser,
          );
        }),
      );
  }

  logout(): void {
    this.tokenStorage.clearToken();
    this.currentUserState.set(null);
    this.authenticatedState.set(false);
  }
}