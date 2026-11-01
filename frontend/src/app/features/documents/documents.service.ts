import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface DocumentResponse {
  id: number;
  employeeId: number;
  employeeName: string;
  name: string;
  type: string;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  status: DocumentStatus;
  uploadedAt: string;
  reviewedAt: string | null;
}

export interface UpdateDocumentStatusRequest {
  status: DocumentStatus;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentsService {
  private readonly apiUrl = '/api/documents';

  constructor(private readonly http: HttpClient) {}

  getDocuments(): Observable<DocumentResponse[]> {
    return this.http.get<DocumentResponse[]>(this.apiUrl);
  }

  uploadDocument(
    employeeId: number,
    name: string,
    type: string,
    file: File,
  ): Observable<DocumentResponse> {
    const formData = new FormData();

    formData.append('employeeId', String(employeeId));
    formData.append('name', name);
    formData.append('type', type);
    formData.append('file', file);

    // Do not set Content-Type manually.
    // The browser must add the multipart boundary.
    return this.http.post<DocumentResponse>(this.apiUrl, formData);
  }

  updateDocumentStatus(id: number, status: DocumentStatus): Observable<DocumentResponse> {
    return this.http.patch<DocumentResponse>(`${this.apiUrl}/${id}/status`, {
      status,
    } satisfies UpdateDocumentStatusRequest);
  }

  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, { responseType: 'blob' });
  }
}
