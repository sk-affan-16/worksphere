import { Component, computed, signal } from '@angular/core';
import { EmptyState } from '../../shared/components/empty-state/empty-state';

type NotificationType =
  | 'Task'
  | 'Onboarding'
  | 'Document'
  | 'System';

type NotificationStatus = 'Unread' | 'Read';

interface DemoNotification {
  title: string;
  message: string;
  type: NotificationType;
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

  /*
   * Temporary frontend demo data.
   * This is not the backend notifications API contract.
   */
  private readonly demoNotifications: DemoNotification[] = [
    {
      title: 'Task assigned',
      message: 'A new onboarding task was assigned to you.',
      type: 'Task',
      time: '10 minutes ago',
      status: 'Unread',
    },
    {
      title: 'Document approved',
      message: 'Aarav Sharma identity document was approved.',
      type: 'Document',
      time: '1 hour ago',
      status: 'Unread',
    },
    {
      title: 'Onboarding completed',
      message: 'Priya Das completed the onboarding process.',
      type: 'Onboarding',
      time: '3 hours ago',
      status: 'Read',
    },
    {
      title: 'System update',
      message: 'WorkSphere dashboard information was refreshed.',
      type: 'System',
      time: 'Yesterday',
      status: 'Read',
    },
    {
      title: 'Task approaching deadline',
      message: 'Verify bank details is due tomorrow.',
      type: 'Task',
      time: 'Yesterday',
      status: 'Unread',
    },
  ];

  readonly filteredNotifications = computed(() => {
    const filter = this.filter();

    return this.demoNotifications.filter((notification) => {
      return filter === 'All' || notification.status === filter;
    });
  });

  readonly unreadCount = computed(() => {
    return this.demoNotifications.filter(
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
    notification: DemoNotification,
  ): string {
    return notification.title;
  }
}
