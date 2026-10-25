import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type OrganizationStatus = 'ACTIVE' | 'INACTIVE';

export interface OrganizationResponse {
  id: number;
  name: string;
  status: OrganizationStatus;
  createdAt: string;
}

export interface UpdateOrganizationRequest {
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  private readonly apiUrl = '/api/organizations/me';

  constructor(
    private readonly http: HttpClient,
  ) {}

  getCurrentOrganization(): Observable<OrganizationResponse> {
    return this.http.get<OrganizationResponse>(
      this.apiUrl,
    );
  }

  updateCurrentOrganization(
    request: UpdateOrganizationRequest,
  ): Observable<OrganizationResponse> {
    return this.http.patch<OrganizationResponse>(
      this.apiUrl,
      request,
    );
  }
}
