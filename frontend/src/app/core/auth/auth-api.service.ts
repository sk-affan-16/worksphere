import { Injectable } from '@angular/core';
import {
  HttpClient,
} from '@angular/common/http';
import { Observable } from 'rxjs';

export type UserRole =
  | 'ORG_ADMIN'
  | 'EMPLOYEE';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
}

export interface CurrentUserResponse {
  userId: number;
  organizationId: number;
  email: string;
  role: UserRole;
}

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly loginApiUrl =
    '/api/auth/login';

  private readonly currentUserApiUrl =
    '/api/auth/me';

  constructor(
    private readonly http: HttpClient,
  ) {}

  login(
    request: LoginRequest,
  ): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      this.loginApiUrl,
      request,
    );
  }

  getCurrentUser(): Observable<CurrentUserResponse> {
    return this.http.get<CurrentUserResponse>(
      this.currentUserApiUrl,
    );
  }
}