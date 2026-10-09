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

    expect(quickActionButtons.length).toBe(4);
  });

  it('should contain the employee statistics', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Total Employees');
    expect(compiled.textContent).toContain('128');
  });

  it('should link dashboard actions to the correct routes', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    const links = Array.from(
      compiled.querySelectorAll<HTMLElement>('[routerLink]'),
    );

    const routes = links.map((link) =>
      link.getAttribute('routerLink'),
    );

    expect(routes).toEqual([
      '/employees',
      '/employees',
      '/tasks',
      '/onboarding',
      '/documents',
    ]);
  });
});
