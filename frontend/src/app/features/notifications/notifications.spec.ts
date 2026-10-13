import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Notifications } from './notifications';

describe('Notifications', () => {
  const storageKey = 'worksphere_notifications';

  let component: Notifications;
  let fixture: ComponentFixture<Notifications>;

  beforeEach(async () => {
    localStorage.removeItem(storageKey);
    await TestBed.configureTestingModule({
      imports: [Notifications],
    }).compileComponents();

    fixture = TestBed.createComponent(Notifications);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    localStorage.removeItem(storageKey);
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render notification records', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const cards = compiled.querySelectorAll(
      '.notification-card',
    );

    expect(cards.length).toBe(5);
  });

  it('should calculate unread notification count', () => {
    expect(component.unreadCount()).toBe(3);
  });

  it('should filter unread notifications', () => {
    component.updateFilter('Unread');

    expect(
      component.filteredNotifications().length,
    ).toBe(3);
  });

  it('should filter read notifications', () => {
    component.updateFilter('Read');

    expect(
      component.filteredNotifications().length,
    ).toBe(2);
  });

  it('should provide an accessible label for the notification filters', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const filterBar = compiled.querySelector('.filter-bar');

    expect(
      filterBar?.getAttribute('role'),
    ).toBe('group');

    expect(
      filterBar?.getAttribute('aria-label'),
    ).toBe('Notification filter');
  });

  it('should expose the selected notification filter accessibly', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const buttons = Array.from(
      compiled.querySelectorAll<HTMLButtonElement>(
        '.filter-button',
      ),
    );

    expect(buttons.length).toBe(3);

    expect(
      buttons[0].getAttribute('aria-pressed'),
    ).toBe('true');

    expect(
      buttons[1].getAttribute('aria-pressed'),
    ).toBe('false');

    expect(
      buttons[2].getAttribute('aria-pressed'),
    ).toBe('false');

    component.updateFilter('Unread');
    fixture.detectChanges();

    expect(
      buttons[0].getAttribute('aria-pressed'),
    ).toBe('false');

    expect(
      buttons[1].getAttribute('aria-pressed'),
    ).toBe('true');

    expect(
      buttons[2].getAttribute('aria-pressed'),
    ).toBe('false');
  });

  it('should provide accessible names for notification cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const cards = Array.from(
      compiled.querySelectorAll<HTMLElement>(
        '.notification-card',
      ),
    );

    expect(cards.length).toBe(5);

    expect(
      cards.every((card) => {
        const labelledBy =
          card.getAttribute('aria-labelledby');

        return (
          labelledBy !== null &&
          card.querySelector(`#${labelledBy}`) !== null
        );
      }),
    ).toBe(true);
  });

  it('should hide notification icons from screen readers', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const icons = Array.from(
      compiled.querySelectorAll('.notification-icon'),
    );

    expect(icons.length).toBe(5);

    expect(
      icons.every(
        (icon) =>
          icon.getAttribute('aria-hidden') === 'true',
      ),
    ).toBe(true);
  });

  it('should expose unread notifications as status indicators', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const unreadIndicators = Array.from(
      compiled.querySelectorAll(
        '.unread-dot[role="status"]',
      ),
    );

    expect(unreadIndicators.length).toBe(3);

    expect(
      unreadIndicators.every(
        (indicator) =>
          indicator.getAttribute('aria-label') ===
          'Unread notification',
      ),
    ).toBe(true);
  });

  it('should mark an unread notification as read', () => {
    expect(component.unreadCount()).toBe(3);

    component.markAsRead('Task assigned');

    expect(component.unreadCount()).toBe(2);

    component.updateFilter('Read');

    expect(
      component.filteredNotifications().some(
        (notification) =>
          notification.title === 'Task assigned' &&
          notification.status === 'Read',
      ),
    ).toBe(true);
  });

  it('should remove a marked notification from the unread filter', () => {
    component.updateFilter('Unread');

    expect(
      component.filteredNotifications().some(
        (notification) =>
          notification.title === 'Task assigned',
      ),
    ).toBe(true);

    component.markAsRead('Task assigned');

    expect(
      component.filteredNotifications().some(
        (notification) =>
          notification.title === 'Task assigned',
      ),
    ).toBe(false);

    expect(
      component.filteredNotifications().length,
    ).toBe(2);
  });

  it('should render mark as read buttons only for unread notifications', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const buttons = compiled.querySelectorAll(
      '.mark-read-button',
    );

    expect(buttons.length).toBe(3);

    expect(compiled.textContent).toContain(
      'Mark as Read',
    );
  });

  it('should update the notification UI after marking it as read', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.textContent,
    ).toContain('Task assigned');

    expect(
      compiled.querySelectorAll('.mark-read-button').length,
    ).toBe(3);

    component.markAsRead('Task assigned');
    fixture.detectChanges();

    expect(
      compiled.querySelectorAll('.mark-read-button').length,
    ).toBe(2);

    const taskCard = Array.from(
      compiled.querySelectorAll<HTMLElement>(
        '.notification-card',
      ),
    ).find((card) =>
      card.textContent?.includes('Task assigned'),
    );

    expect(taskCard).toBeTruthy();
    expect(
      taskCard?.classList.contains('unread'),
    ).toBe(false);
  });
});
