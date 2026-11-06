import { Component, computed, signal } from '@angular/core';
import { EmptyState } from '../../shared/components/empty-state/empty-state';

type NotificationStatus = 'Unread' | 'Read';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  time: string;
  status: NotificationStatus;
}

@Component({
  selector: 'app-notifications',
  imports: [EmptyState],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class Notifications {
  readonly filter = signal<'All' | 'Unread' | 'Read'>('All');

  // Start with no notifications.
  // Real notifications will be loaded from the backend API later.
  private readonly notifications: NotificationItem[] = [];

  readonly filteredNotifications = computed(() => {
    const filter = this.filter();

    return this.notifications.filter((notification) => {
      return filter === 'All' || notification.status === filter;
    });
  });

  readonly unreadCount = computed(() => {
    return this.notifications.filter(
      (notification) => notification.status === 'Unread',
    ).length;
  });

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
    notification: NotificationItem,
  ): string {
    return notification.id;
  }
}
