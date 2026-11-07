import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'TO_DO' | 'IN_PROGRESS' | 'COMPLETED';

export interface TaskResponse {
  id: number;
  title: string;
  assigneeEmployeeId: number;
  assigneeName: string;
  assigneeEmail: string;
  department: string | null;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  assigneeEmail: string;
  dueDate: string;
  priority: TaskPriority;
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
}

export interface TaskMessageResponse {
  id: number;
  taskId: number;
  senderId: number;
  senderEmail: string;
  content: string;
  createdAt: string;
}

export interface SendTaskMessageRequest {
  content: string;
}

@Injectable({ providedIn: 'root' })
export class TasksApiService {
  private readonly apiUrl = '/api/tasks';

  constructor(private readonly http: HttpClient) {}

  getOrganizationTasks(): Observable<TaskResponse[]> {
    return this.http.get<TaskResponse[]>(this.apiUrl);
  }

  getMyTasks(): Observable<TaskResponse[]> {
    return this.http.get<TaskResponse[]>(`${this.apiUrl}/me`);
  }

  createTask(request: CreateTaskRequest): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(this.apiUrl, request);
  }

  updateTaskStatus(
    taskId: number,
    request: UpdateTaskStatusRequest,
  ): Observable<TaskResponse> {
    return this.http.patch<TaskResponse>(
      `${this.apiUrl}/${taskId}/status`,
      request,
    );
  }

  getTaskMessages(taskId: number): Observable<TaskMessageResponse[]> {
    return this.http.get<TaskMessageResponse[]>(
      `${this.apiUrl}/${taskId}/messages`,
    );
  }

  sendTaskMessage(
    taskId: number,
    request: SendTaskMessageRequest,
  ): Observable<TaskMessageResponse> {
    return this.http.post<TaskMessageResponse>(
      `${this.apiUrl}/${taskId}/messages`,
      request,
    );
  }
}
