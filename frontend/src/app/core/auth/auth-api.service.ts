
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type UserRole = 'ORG_ADMIN' | 'EMPLOYEE';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
}

export interface RegisterRequest {
  organizationName: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  phone: string;
  password: string;
}

export interface RegisterResponse {
  code: string;
  message: string;
}

export interface CurrentUserResponse {
  userId: number;
  organizationId: number;
  email: string;
  role: UserRole;
  firstName?: string | null;
  lastName?: string | null;
  jobTitle?: string | null;
  profilePhotoUrl?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {

  private readonly loginApiUrl = '/api/auth/login';
  private readonly registerApiUrl = '/api/auth/register';
  private readonly currentUserApiUrl = '/api/auth/me';
  private readonly profilePhotoApiUrl = '/api/auth/profile-photo';

  constructor(
    private readonly http: HttpClient,
  ) {}

  /**
   * Authenticates an existing user.
   */
  login(request: LoginRequest): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      this.loginApiUrl,
      request,
    );
  }

  /**
   * Registers a new organization administrator.
   *
   * Always uses multipart/form-data because the backend
   * registration endpoint accepts multipart form data.
   *
   * Profile photo is optional.
   */
  register(
    request: RegisterRequest,
    profilePhoto: File | null = null,
  ): Observable<RegisterResponse> {

    const formData = new FormData();

    formData.append(
      'organizationName',
      request.organizationName.trim(),
    );

    formData.append(
      'firstName',
      request.firstName.trim(),
    );

    formData.append(
      'lastName',
      request.lastName.trim(),
    );

    formData.append(
      'email',
      request.email.trim(),
    );

    formData.append(
      'jobTitle',
      request.jobTitle.trim(),
    );

    formData.append(
      'department',
      request.department.trim(),
    );

    formData.append(
      'phone',
      request.phone.trim(),
    );

    formData.append(
      'password',
      request.password,
    );

    // Add profile photo only when the user selects one.
    if (profilePhoto) {
      formData.append(
        'profilePhoto',
        profilePhoto,
        profilePhoto.name,
      );
    }

    // Do not manually set Content-Type.
    // The browser automatically adds the multipart boundary.
    return this.http.post<RegisterResponse>(
      this.registerApiUrl,
      formData,
    );
  }

  /**
   * Retrieves the currently authenticated user's details.
   */
  getCurrentUser(): Observable<CurrentUserResponse> {

    return this.http.get<CurrentUserResponse>(
      this.currentUserApiUrl,
    );
  }

  /**
   * Retrieves the authenticated user's profile photo.
   */
  getProfilePhoto(): Observable<Blob> {

    return this.http.get(
      this.profilePhotoApiUrl,
      {
        responseType: 'blob',
      },
    );
  }
}
