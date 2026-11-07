import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { Auth } from '../../core/auth/auth';
import { Notifications } from './notifications';

describe('Notifications', () => {
  let component: Notifications;
  let fixture: ComponentFixture<Notifications>;
  let httpTesting: HttpTestingController;

  const taskNotification = {
    id: 11,
    title: 'New task assigned',
    message: 'You have been assigned a task: Prepare report',
    type: 'TASK_ASSIGNED',
    time: '11/7/2026, 10:00:00 AM',
    status: 'Unread' as const,
    taskId: 42,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Notifications],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: Auth,
          useValue: {
            currentUser: () => ({
              userId: 7,
              organizationId: 3,
              email: 'employee@example.com',
              role: 'EMPLOYEE',
            }),
          },
        },
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(Notifications);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const request = httpTesting.expectOne('/api/notifications');
    expect(request.request.method).toBe('GET');
    request.flush([]);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load notifications from the backend', () => {
    expect(component.notifications()).toEqual([]);
  });

  it('should display the unread notification count', () => {
    expect(component.unreadCount()).toBe(0);
  });

  it('should filter unread notifications', () => {
    component.notifications.set([taskNotification]);
    component.updateFilter('Unread');

    expect(component.filter()).toBe('Unread');
    expect(component.filteredNotifications()).toEqual([taskNotification]);
  });

  it('should filter read notifications', () => {
    component.notifications.set([
      { ...taskNotification, status: 'Read' },
      taskNotification,
    ]);
    component.updateFilter('Read');

    expect(component.filteredNotifications()).toEqual([
      { ...taskNotification, status: 'Read' },
    ]);
  });

  it('should mark a notification as read through the backend', () => {
    component.notifications.set([taskNotification]);
    component.markAsRead(taskNotification);

    const request = httpTesting.expectOne('/api/notifications/11/read');
    expect(request.request.method).toBe('PATCH');
    request.flush({
      id: 11,
      title: taskNotification.title,
      message: taskNotification.message,
      type: taskNotification.type,
      read: true,
      createdAt: '2026-11-07T10:00:00Z',
      taskId: 42,
    });

    expect(component.notifications()[0].status).toBe('Read');
  });

  it('should display an empty state when there are no notifications', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No notifications');
  });

  it('should identify task notifications as conversation-capable', () => {
    expect(component.isTaskNotification(taskNotification)).toBe(true);
    expect(component.isTaskNotification({
      ...taskNotification,
      type: 'GENERAL',
    })).toBe(false);
  });

  it('should load persisted messages when a task conversation is opened', () => {
    component.openConversation(taskNotification);

    const request = httpTesting.expectOne('/api/tasks/42/messages');
    expect(request.request.method).toBe('GET');
    request.flush([
      {
        id: 1,
        taskId: 42,
        senderId: 9,
        senderEmail: 'admin@example.com',
        content: 'Please prepare the report.',
        createdAt: '2026-11-07T09:00:00Z',
      },
    ]);

    expect(component.messages()).toHaveLength(1);
    expect(component.messages()[0].content).toBe(
      'Please prepare the report.',
    );
    expect(component.selectedConversation()?.taskId).toBe(42);
  });

  it('should send a reply and append the persisted response', () => {
    component.openConversation(taskNotification);
    const loadRequest = httpTesting.expectOne('/api/tasks/42/messages');
    loadRequest.flush([]);

    component.updateMessageDraft('  I will prepare it today.  ');
    component.sendReply();

    const sendRequest = httpTesting.expectOne('/api/tasks/42/messages');
    expect(sendRequest.request.method).toBe('POST');
    expect(sendRequest.request.body).toEqual({
      content: 'I will prepare it today.',
    });

    sendRequest.flush({
      id: 2,
      taskId: 42,
      senderId: 7,
      senderEmail: 'employee@example.com',
      content: 'I will prepare it today.',
      createdAt: '2026-11-07T10:05:00Z',
    });

    expect(component.messages()).toHaveLength(1);
    expect(component.messages()[0].content).toBe(
      'I will prepare it today.',
    );
    expect(component.messageDraft()).toBe('');
    expect(component.isOwnMessage(component.messages()[0])).toBe(true);
  });

  it('should not send an empty reply', () => {
    component.openConversation(taskNotification);
    httpTesting.expectOne('/api/tasks/42/messages').flush([]);

    component.updateMessageDraft('   ');
    component.sendReply();

    httpTesting.expectNone({
      method: 'POST',
      url: '/api/tasks/42/messages',
    });
  });

  it('should close the conversation and clear its draft', () => {
    component.selectedConversation.set(taskNotification);
    component.updateMessageDraft('Draft message');

    component.closeConversation();

    expect(component.selectedConversation()).toBeNull();
    expect(component.messageDraft()).toBe('');
    expect(component.messages()).toEqual([]);
  });

  it('should display accessible notification filters', () => {
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    );

    expect(buttons.length).toBeGreaterThan(0);
  });
});
