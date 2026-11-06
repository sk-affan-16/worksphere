import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Notifications } from './notifications';

describe('Notifications', () => {
  let component: Notifications;
  let fixture: ComponentFixture<Notifications>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Notifications],
    }).compileComponents();

    fixture = TestBed.createComponent(Notifications);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render no notification records by default', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelectorAll('.notification-card').length,
    ).toBe(0);
  });

  it('should calculate unread notification count as zero', () => {
    expect(component.unreadCount()).toBe(0);
  });

  it('should show no notifications for the All filter', () => {
    component.updateFilter('All');

    expect(component.filteredNotifications().length).toBe(0);
  });

  it('should show no notifications for the Unread filter', () => {
    component.updateFilter('Unread');

    expect(component.filteredNotifications().length).toBe(0);
  });

  it('should show no notifications for the Read filter', () => {
    component.updateFilter('Read');

    expect(component.filteredNotifications().length).toBe(0);
  });

  it('should provide an accessible label for the notification filters', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const filterBar = compiled.querySelector('.filter-bar');

    expect(filterBar?.getAttribute('role')).toBe('group');
    expect(filterBar?.getAttribute('aria-label')).toBe(
      'Notification filter',
    );
  });

  it('should expose the selected notification filter accessibly', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const buttons = Array.from(
      compiled.querySelectorAll<HTMLButtonElement>('.filter-button'),
    );

    expect(buttons.length).toBe(3);

    expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('false');
    expect(buttons[2].getAttribute('aria-pressed')).toBe('false');

    component.updateFilter('Unread');
    fixture.detectChanges();

    expect(buttons[0].getAttribute('aria-pressed')).toBe('false');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
    expect(buttons[2].getAttribute('aria-pressed')).toBe('false');
  });

  it('should display the empty notification state', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const emptyState = compiled.querySelector('app-empty-state');

    expect(emptyState).not.toBeNull();
    expect(compiled.textContent).toContain('No notifications');
  });

  it('should not render notification icons or unread indicators', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelectorAll('.notification-icon').length,
    ).toBe(0);

    expect(
      compiled.querySelectorAll('.unread-dot').length,
    ).toBe(0);
  });
});
