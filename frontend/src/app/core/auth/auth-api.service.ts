import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly apiUrl = '/api/auth/login';

  constructor(
    private readonly http: HttpClient,
  ) {}

  login(
    request: LoginRequest,
  ): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      this.apiUrl,
      request,
    );
  }
}
