
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type OnboardingStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED';

export interface OnboardingResponse {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  status: OnboardingStatus;
  createdAt: string;
  completedAt: string | null;
}

export interface CreateOnboardingRequest {
  employeeId: number;
}

export interface UpdateOnboardingStatusRequest {
  status: OnboardingStatus;
}

@Injectable({
  providedIn: 'root',
})
export class OnboardingService {

  private readonly apiUrl = '/api/onboardings';

  constructor(
    private readonly http: HttpClient,
  ) {}

  /**
   * Retrieves all onboarding records
   * belonging to the authenticated organization.
   */
  getOnboardings(): Observable<OnboardingResponse[]> {
    return this.http.get<OnboardingResponse[]>(
      this.apiUrl,
    );
  }

  /**
   * Creates onboarding for an existing employee.
   */
  createOnboarding(
    request: CreateOnboardingRequest,
  ): Observable<OnboardingResponse> {
    return this.http.post<OnboardingResponse>(
      this.apiUrl,
      request,
    );
  }

  /**
   * Updates an onboarding record's status.
   */
  updateOnboardingStatus(
    onboardingId: number,
    request: UpdateOnboardingStatusRequest,
  ): Observable<OnboardingResponse> {
    return this.http.patch<OnboardingResponse>(
      `${this.apiUrl}/${onboardingId}/status`,
      request,
    );
  }

  /**
   * Retrieves one onboarding record by ID.
   */
  getOnboarding(
    onboardingId: number,
  ): Observable<OnboardingResponse> {
    return this.http.get<OnboardingResponse>(
      `${this.apiUrl}/${onboardingId}`,
    );
  }
}
