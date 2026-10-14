import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenStorage {
  private readonly tokenKey = 'worksphere_token';

  saveToken(token: string, rememberMe = false): void {
    this.clearToken();

    const storage = rememberMe
      ? localStorage
      : sessionStorage;

    storage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return (
      localStorage.getItem(this.tokenKey) ??
      sessionStorage.getItem(this.tokenKey)
    );
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.tokenKey);
  }
}
