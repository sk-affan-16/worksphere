import { Component, computed, signal } from '@angular/core';

import { EmptyState } from '../../shared/components/empty-state/empty-state';
import {
  NotificationRecord,
  NotificationsService,
  NotificationStatus,
} from './notifications.service';

@Component({
  selector: 'app-notifications',
  imports: [EmptyState],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class Notifications {
  readonly filter =
    signal<'All' | NotificationStatus>('All');

  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  readonly filteredNotifications = computed(() => {
    const filter = this.filter();

    return this.notificationsService
      .notificationList()
      .filter((notification) => {
        return (
          filter === 'All' ||
          notification.status === filter
        );
      });
  });

  readonly unreadCount = computed(() => {
    return this.notificationsService
      .notificationList()
      .filter(
        (notification) =>
          notification.status === 'Unread',
      ).length;
  });

  markAsRead(notificationTitle: string): void {
    this.notificationsService.markAsRead(
      notificationTitle,
    );
  }

  updateFilter(value: string): void {
    if (
      value === 'All' ||
      value === 'Unread' ||
      value === 'Read'
    ) {
      this.filter.set(value);
    }
  }

  protected trackNotification(
    _index: number,
    notification: NotificationRecord,
  ): string {
    return notification.title;
  }
}
