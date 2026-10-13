import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render dashboard statistics', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const statCards = compiled.querySelectorAll('.stat-card');

    expect(statCards.length).toBe(4);
  });

  it('should render recent activities', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const activityItems =
      compiled.querySelectorAll('.activity-item');

    expect(activityItems.length).toBe(3);
  });

  it('should render quick actions', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const quickActionButtons =
      compiled.querySelectorAll('.quick-actions button');

    expect(quickActionButtons.length).toBe(6);
  });

  it('should contain the employee statistics', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Total Employees');
    expect(compiled.textContent).toContain('128');
  });

  it('should configure dashboard actions with the correct routes', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    const addEmployeeButton =
      compiled.querySelector('.primary-button');

    expect(
      addEmployeeButton?.getAttribute('routerLink'),
    ).toBe('/employees');

    expect(
      component.quickActions.map((action) => action.route),
    ).toEqual([
      '/employees',
      '/tasks',
      '/onboarding',
      '/documents',
      '/organization',
      '/notifications',
    ]);

    const actionButtons =
      compiled.querySelectorAll('.quick-actions button');

    expect(actionButtons.length).toBe(6);

    actionButtons.forEach((button, index) => {
      expect(button.textContent?.trim()).toBe(
        component.quickActions[index].label,
      );
    });
  });

  it('should provide accessible names for dashboard sections', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const recentActivity = compiled.querySelector(
      'section[aria-labelledby="recent-activity-title"]',
    );

    const quickActions = compiled.querySelector(
      'section[aria-labelledby="quick-actions-title"]',
    );

    expect(recentActivity).toBeTruthy();
    expect(quickActions).toBeTruthy();

    expect(
      recentActivity?.querySelector('#recent-activity-title')
        ?.textContent?.trim(),
    ).toBe('Recent Activity');

    expect(
      quickActions?.querySelector('#quick-actions-title')
        ?.textContent?.trim(),
    ).toBe('Quick Actions');
  });

  it('should hide decorative activity icons from screen readers', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const icons = Array.from(
      compiled.querySelectorAll('.activity-icon'),
    );

    expect(icons.length).toBe(3);

    expect(
      icons.every(
        (icon) => icon.getAttribute('aria-hidden') === 'true',
      ),
    ).toBe(true);
  });
});
