import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type EmployeeStatus = 'ACTIVE' | 'DISABLED';

export interface EmployeeResponse {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  jobTitle: string | null;
  department: string | null;
  hireDate: string | null;
  status: EmployeeStatus;
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string | null;
  jobTitle: string | null;
  department: string | null;
  hireDate: string | null;
}

export interface UpdateEmployeeRequest {
  firstName: string;
  lastName: string;
  phone: string | null;
  jobTitle: string | null;
  department: string | null;
  hireDate: string | null;
}

export interface UpdateEmployeeStatusRequest {
  status: EmployeeStatus;
}

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly apiUrl = '/api/employees';

  constructor(private readonly http: HttpClient) {}

  getEmployees(): Observable<EmployeeResponse[]> {
    return this.http.get<EmployeeResponse[]>(this.apiUrl);
  }

  getEmployee(id: number): Observable<EmployeeResponse> {
    return this.http.get<EmployeeResponse>(`${this.apiUrl}/${id}`);
  }

  createEmployee(
    request: CreateEmployeeRequest,
  ): Observable<EmployeeResponse> {
    return this.http.post<EmployeeResponse>(this.apiUrl, request);
  }

  updateEmployee(
    id: number,
    request: UpdateEmployeeRequest,
  ): Observable<EmployeeResponse> {
    return this.http.patch<EmployeeResponse>(
      `${this.apiUrl}/${id}`,
      request,
    );
  }

  updateEmployeeStatus(
    id: number,
    request: UpdateEmployeeStatusRequest,
  ): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/${id}/status`,
      request,
    );
  }
}
