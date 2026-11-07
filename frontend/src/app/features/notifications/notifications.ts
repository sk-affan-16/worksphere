import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Auth } from '../../core/auth/auth';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import {
  NotificationResponse,
  NotificationsApiService,
} from './notifications-api.service';
import {
  TaskMessageResponse,
  TasksApiService,
} from '../tasks/tasks-api.service';

type NotificationStatus = 'Unread' | 'Read';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  time: string;
  status: NotificationStatus;
  taskId: number;
}

@Component({
  selector: 'app-notifications',
  imports: [EmptyState],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class Notifications implements OnInit {
  private readonly notificationsApi = inject(NotificationsApiService);
  private readonly tasksApi = inject(TasksApiService);
  private readonly auth = inject(Auth);

  readonly filter = signal<'All' | 'Unread' | 'Read'>('All');
  readonly notifications = signal<NotificationItem[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly markingReadId = signal<number | null>(null);

  readonly selectedConversation = signal<NotificationItem | null>(null);
  readonly messages = signal<TaskMessageResponse[]>([]);
  readonly conversationLoading = signal(false);
  readonly conversationSending = signal(false);
  readonly conversationError = signal('');
  readonly messageDraft = signal('');

  readonly currentUserId = computed(
    () => this.auth.currentUser()?.userId ?? null,
  );

  readonly filteredNotifications = computed(() => {
    const selectedFilter = this.filter();

    return this.notifications().filter((notification) => {
      return (
        selectedFilter === 'All' ||
        notification.status === selectedFilter
      );
    });
  });

  readonly unreadCount = computed(() =>
    this.notifications().filter(
      (notification) => notification.status === 'Unread',
    ).length,
  );

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.notificationsApi.getMyNotifications().subscribe({
      next: (response) => {
        this.notifications.set(response.map((item) => this.mapNotification(item)));
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set(
          'Unable to load notifications. Please try again.',
        );
        this.loading.set(false);
      },
    });
  }

  openConversation(notification: NotificationItem): void {
    if (!this.isTaskNotification(notification)) {
      return;
    }

    this.selectedConversation.set(notification);
    this.messages.set([]);
    this.messageDraft.set('');
    this.conversationError.set('');
    this.loadConversationMessages();
  }

  closeConversation(): void {
    this.selectedConversation.set(null);
    this.messages.set([]);
    this.messageDraft.set('');
    this.conversationError.set('');
    this.conversationLoading.set(false);
    this.conversationSending.set(false);
  }

  loadConversationMessages(): void {
    const notification = this.selectedConversation();

    if (!notification) {
      return;
    }

    this.conversationLoading.set(true);
    this.conversationError.set('');

    this.tasksApi.getTaskMessages(notification.taskId).subscribe({
      next: (messages) => {
        if (this.selectedConversation()?.taskId === notification.taskId) {
          this.messages.set(messages);
        }
        this.conversationLoading.set(false);
      },
      error: () => {
        this.conversationError.set(
          'Unable to load this task conversation. Please try again.',
        );
        this.conversationLoading.set(false);
      },
    });
  }

  updateMessageDraft(value: string): void {
    this.messageDraft.set(value.slice(0, 2000));
  }

  sendReply(): void {
    const notification = this.selectedConversation();
    const content = this.messageDraft().trim();

    if (!notification || !content || this.conversationSending()) {
      return;
    }

    this.conversationSending.set(true);
    this.conversationError.set('');

    this.tasksApi.sendTaskMessage(notification.taskId, { content }).subscribe({
      next: (message) => {
        if (this.selectedConversation()?.taskId === notification.taskId) {
          this.messages.update((messages) => [...messages, message]);
          this.messageDraft.set('');
        }
        this.conversationSending.set(false);
      },
      error: () => {
        this.conversationError.set(
          'Unable to send your reply. Please try again.',
        );
        this.conversationSending.set(false);
      },
    });
  }

  isOwnMessage(message: TaskMessageResponse): boolean {
    return this.currentUserId() !== null &&
      message.senderId === this.currentUserId();
  }

  isTaskNotification(notification: NotificationItem): boolean {
    return (
      notification.taskId > 0 &&
      (notification.type === 'TASK_ASSIGNED' ||
        notification.type === 'TASK_MESSAGE')
    );
  }

  markAsRead(notification: NotificationItem): void {
    if (
      notification.status === 'Read' ||
      this.markingReadId() !== null
    ) {
      return;
    }

    this.markingReadId.set(notification.id);
    this.errorMessage.set('');

    this.notificationsApi.markAsRead(notification.id).subscribe({
      next: (response) => {
        this.notifications.update((items) =>
          items.map((item) =>
            item.id === response.id
              ? this.mapNotification(response)
              : item,
          ),
        );
        this.markingReadId.set(null);
      },
      error: () => {
        this.errorMessage.set(
          'Unable to mark this notification as read. Please try again.',
        );
        this.markingReadId.set(null);
      },
    });
  }

  updateFilter(value: string): void {
    if (value === 'All' || value === 'Unread' || value === 'Read') {
      this.filter.set(value);
    }
  }

  protected trackNotification(
    _index: number,
    notification: NotificationItem,
  ): number {
    return notification.id;
  }

  protected trackMessage(
    _index: number,
    message: TaskMessageResponse,
  ): number {
    return message.id;
  }

  private mapNotification(
    response: NotificationResponse,
  ): NotificationItem {
    return {
      id: response.id,
      title: response.title,
      message: response.message,
      type: response.type,
      time: this.formatTime(response.createdAt),
      status: response.read ? 'Read' : 'Unread',
      taskId: response.taskId,
    };
  }

  protected formatMessageTime(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  }

  private formatTime(value: string): string {
    return this.formatMessageTime(value);
  }
}
