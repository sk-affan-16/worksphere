import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { Auth } from '../../auth/auth';
import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;

  let auth: {
    isOrgAdmin: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    auth = {
      isOrgAdmin: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [
        {
          provide: Auth,
          useValue: auth,
        },
        provideRouter([
          {
            path: 'dashboard',
            children: [],
          },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all navigation links for an organization admin', () => {
    auth.isOrgAdmin.mockReturnValue(true);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll(
      '.navigation .nav-item',
    );

    expect(links.length).toBe(8);
  });

  it('should hide admin navigation links for an employee', () => {
    auth.isOrgAdmin.mockReturnValue(false);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll(
      '.navigation .nav-item',
    );

    expect(links.length).toBe(6);
    expect(
      compiled.querySelector('a[routerLink="/organization"]'),
    ).toBeNull();
    expect(
      compiled.querySelector('a[routerLink="/employees"]'),
    ).toBeNull();
  });

  it('should contain all navigation routes for an organization admin', () => {
    auth.isOrgAdmin.mockReturnValue(true);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(
      compiled.querySelectorAll<HTMLAnchorElement>(
        '.navigation .nav-item',
      ),
    );

    const hrefs = links.map((link) =>
      link.getAttribute('href'),
    );

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

  it('should contain only employee-accessible routes for an employee', () => {
    auth.isOrgAdmin.mockReturnValue(false);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(
      compiled.querySelectorAll<HTMLAnchorElement>(
        '.navigation .nav-item',
      ),
    );

    const hrefs = links.map((link) =>
      link.getAttribute('href'),
    );

    expect(hrefs).toEqual([
      '/dashboard',
      '/onboarding',
      '/documents',
      '/tasks',
      '/workflow',
      '/notifications',
    ]);
  });

  it('should label the navigation for accessibility', () => {
    auth.isOrgAdmin.mockReturnValue(true);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const navigation = compiled.querySelector('.navigation');

    expect(navigation?.getAttribute('aria-label')).toBe(
      'Primary navigation',
    );
  });

  it('should hide decorative navigation icons from screen readers', () => {
    auth.isOrgAdmin.mockReturnValue(true);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const icons = Array.from(
      compiled.querySelectorAll('.navigation .nav-icon'),
    );

    expect(icons.length).toBe(8);
    expect(
      icons.every(
        (icon) =>
          icon.getAttribute('aria-hidden') === 'true',
      ),
    ).toBe(true);
  });

  it('should mark the active navigation link as the current page', async () => {
    auth.isOrgAdmin.mockReturnValue(true);

    const router = TestBed.inject(Router);

    fixture.detectChanges();

    await router.navigateByUrl('/dashboard');

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const dashboardLink = compiled.querySelector(
      'a[routerLink="/dashboard"]',
    );

    expect(
      dashboardLink?.getAttribute('aria-current'),
    ).toBe('page');
  });
});