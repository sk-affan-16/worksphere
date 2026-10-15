import { Injectable, signal } from '@angular/core';

export type NotificationType =
  | 'Task'
  | 'Onboarding'
  | 'Document'
  | 'System';

export type NotificationStatus =
  | 'Unread'
  | 'Read';

export interface NotificationRecord {
  title: string;
  message: string;
  type: NotificationType;
  time: string;
  status: NotificationStatus;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private readonly storageKey =
    'worksphere_notifications';

  private readonly notifications =
    signal<NotificationRecord[]>(
      this.loadNotifications(),
    );

  readonly notificationList =
    this.notifications.asReadonly();

  markAsRead(notificationTitle: string): void {
    this.notifications.update((notifications) => {
      let changed = false;

      const updatedNotifications =
        notifications.map((notification) => {
          if (
            notification.title !== notificationTitle ||
            notification.status === 'Read'
          ) {
            return notification;
          }

          changed = true;

          return {
            ...notification,
            status: 'Read' as NotificationStatus,
          };
        });

      if (changed) {
        this.saveNotifications(updatedNotifications);
      }

      return updatedNotifications;
    });
  }

  private loadNotifications(): NotificationRecord[] {
    const storedNotifications = localStorage.getItem(
      this.storageKey,
    );

    if (!storedNotifications) {
      return this.getDefaultNotifications();
    }

    try {
      const parsedNotifications = JSON.parse(
        storedNotifications,
      );

      if (Array.isArray(parsedNotifications)) {
        return parsedNotifications as NotificationRecord[];
      }
    } catch {
      // Fall back to the default demo data.
    }

    return this.getDefaultNotifications();
  }

  private saveNotifications(
    notifications: NotificationRecord[],
  ): void {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify(notifications),
    );
  }

  private getDefaultNotifications(): NotificationRecord[] {
    return [
      {
        title: 'Task assigned',
        message:
          'A new onboarding task was assigned to you.',
        type: 'Task',
        time: '10 minutes ago',
        status: 'Unread',
      },
      {
        title: 'Document approved',
        message:
          'Aarav Sharma identity document was approved.',
        type: 'Document',
        time: '1 hour ago',
        status: 'Unread',
      },
      {
        title: 'Onboarding completed',
        message:
          'Priya Das completed the onboarding process.',
        type: 'Onboarding',
        time: '3 hours ago',
        status: 'Read',
      },
      {
        title: 'System update',
        message:
          'WorkSphere dashboard information was refreshed.',
        type: 'System',
        time: 'Yesterday',
        status: 'Read',
      },
      {
        title: 'Task approaching deadline',
        message:
          'Verify bank details is due tomorrow.',
        type: 'Task',
        time: 'Yesterday',
        status: 'Unread',
      },
    ];
  }
}
