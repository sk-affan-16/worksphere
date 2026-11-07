import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { Auth } from '../../auth/auth';
import { UserRole } from '../../auth/auth-api.service';
import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;
  let currentRole: UserRole = 'ORG_ADMIN';

  const mockAuth = {
    role: () => currentRole,
  };

  beforeEach(async () => {
    currentRole = 'ORG_ADMIN';

    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [
        provideRouter([{ path: 'dashboard', children: [] }]),
        { provide: Auth, useValue: mockAuth },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show all eight navigation links for ORG_ADMIN', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('.navigation .nav-item');

    expect(links.length).toBe(8);
  });

  it('should show only five navigation links for EMPLOYEE', () => {
    currentRole = 'EMPLOYEE';

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('.navigation .nav-item');

    expect(links.length).toBe(5);

    expect(
      compiled.querySelector('a[routerLink="/organization"]'),
    ).toBeNull();

    expect(
      compiled.querySelector('a[routerLink="/employees"]'),
    ).toBeNull();

    expect(
      compiled.querySelector('a[routerLink="/onboarding"]'),
    ).toBeNull();
  });

  it('should contain all expected routes for ORG_ADMIN', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(
      compiled.querySelectorAll<HTMLAnchorElement>('.navigation .nav-item'),
    );

    const hrefs = links.map((link) => link.getAttribute('href'));

    expect(hrefs).toEqual([
      '/dashboard',
      '/organization',
      '/employees',
      '/onboarding',
      '/documents',
      '/tasks',
      '/workflow',
      '/notifications',
    ]);
  });

  it('should contain only employee-accessible routes for EMPLOYEE', () => {
    currentRole = 'EMPLOYEE';

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(
      compiled.querySelectorAll<HTMLAnchorElement>('.navigation .nav-item'),
    );

    const hrefs = links.map((link) => link.getAttribute('href'));

    expect(hrefs).toEqual([
      '/dashboard',
      '/documents',
      '/tasks',
      '/workflow',
      '/notifications',
    ]);
  });

  it('should label the navigation for accessibility', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const navigation = compiled.querySelector('.navigation');

    expect(navigation?.getAttribute('aria-label')).toBe(
      'Primary navigation',
    );
  });

  it('should hide decorative navigation icons from screen readers', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const icons = Array.from(
      compiled.querySelectorAll('.navigation .nav-icon'),
    );

    expect(icons.length).toBe(8);

    expect(
      icons.every((icon) => icon.getAttribute('aria-hidden') === 'true'),
    ).toBe(true);
  });

  it('should mark the active navigation link as the current page', async () => {
    const router = TestBed.inject(Router);

    fixture.detectChanges();

    await router.navigateByUrl('/dashboard');

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const dashboardLink = compiled.querySelector(
      'a[routerLink="/dashboard"]',
    );

    expect(dashboardLink?.getAttribute('aria-current')).toBe('page');
  });
});
