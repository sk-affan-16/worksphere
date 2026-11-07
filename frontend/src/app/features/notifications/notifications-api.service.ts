import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  taskId: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/notifications';

  getMyNotifications(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(this.apiUrl);
  }

  markAsRead(notificationId: number): Observable<NotificationResponse> {
    return this.http.patch<NotificationResponse>(
      `${this.apiUrl}/${notificationId}/read`,
      {},
    );
  }
}
