import { TestBed } from '@angular/core/testing';

import {
  NotificationRecord,
  NotificationsService,
} from './notifications.service';

describe('NotificationsService', () => {
  const storageKey = 'worksphere_notifications';

  beforeEach(() => {
    localStorage.removeItem(storageKey);

    TestBed.configureTestingModule({
      providers: [NotificationsService],
    });
  });

  afterEach(() => {
    localStorage.removeItem(storageKey);
    TestBed.resetTestingModule();
  });

  it('should create the service', () => {
    const service = TestBed.inject(NotificationsService);

    expect(service).toBeTruthy();
  });

  it('should load the default notifications when storage is empty', () => {
    const service = TestBed.inject(NotificationsService);

    expect(service.notificationList().length).toBe(5);
  });

  it('should have three unread notifications by default', () => {
    const service = TestBed.inject(NotificationsService);

    const unreadNotifications = service
      .notificationList()
      .filter(
        (notification) => notification.status === 'Unread',
      );

    expect(unreadNotifications.length).toBe(3);
  });

  it('should mark an unread notification as read', () => {
    const service = TestBed.inject(NotificationsService);

    service.markAsRead('Task assigned');

    const notification = service
      .notificationList()
      .find((item) => item.title === 'Task assigned');

    expect(notification).toBeTruthy();
    expect(notification?.status).toBe('Read');
  });

  it('should persist the read status to localStorage', () => {
    const service = TestBed.inject(NotificationsService);

    service.markAsRead('Task assigned');

    const storedNotifications = JSON.parse(
      localStorage.getItem(storageKey) ?? '[]',
    ) as NotificationRecord[];

    const notification = storedNotifications.find(
      (item) => item.title === 'Task assigned',
    );

    expect(notification).toBeTruthy();
    expect(notification?.status).toBe('Read');
  });

  it('should not change an already read notification', () => {
    const service = TestBed.inject(NotificationsService);

    service.markAsRead('Onboarding completed');

    const notification = service
      .notificationList()
      .find(
        (item) => item.title === 'Onboarding completed',
      );

    expect(notification?.status).toBe('Read');
  });

  it('should load previously stored notifications', () => {
    const storedNotifications: NotificationRecord[] = [
      {
        title: 'Stored notification',
        message: 'Stored notification for testing.',
        type: 'System',
        time: 'Just now',
        status: 'Read',
      },
    ];

    localStorage.setItem(
      storageKey,
      JSON.stringify(storedNotifications),
    );

    const service = TestBed.inject(NotificationsService);

    expect(service.notificationList()).toEqual(
      storedNotifications,
    );
  });

  it('should fall back to default notifications when stored data is invalid', () => {
    localStorage.setItem(
      storageKey,
      'invalid-json',
    );

    const service = TestBed.inject(NotificationsService);

    expect(service.notificationList().length).toBe(5);
  });
});
