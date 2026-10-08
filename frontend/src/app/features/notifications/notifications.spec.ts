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

  it('should render notification records', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const cards = compiled.querySelectorAll('.notification-card');

    expect(cards.length).toBe(5);
  });

  it('should calculate unread notification count', () => {
    expect(component.unreadCount()).toBe(3);
  });

  it('should filter unread notifications', () => {
    component.updateFilter('Unread');

    expect(component.filteredNotifications().length).toBe(3);
  });

  it('should filter read notifications', () => {
    component.updateFilter('Read');

    expect(component.filteredNotifications().length).toBe(2);
  });
});
