import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { vi } from 'vitest';

import { Auth } from '../../auth/auth';
import {
  AuthApiService,
  CurrentUserResponse,
} from '../../auth/auth-api.service';
import { Navbar } from './navbar';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  let currentUserState: WritableSignal<CurrentUserResponse | null>;

  let auth: {
    isAuthenticated: ReturnType<typeof vi.fn>;
    currentUser: WritableSignal<CurrentUserResponse | null>;
    logout: ReturnType<typeof vi.fn>;
  };

  let authApiService: {
    getProfilePhoto: ReturnType<typeof vi.fn>;
  };

  let routerEvents: Subject<NavigationEnd>;

  let router: {
    url: string;
    events: Subject<NavigationEnd>;
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    currentUserState = signal<CurrentUserResponse | null>(null);

    auth = {
      isAuthenticated: vi.fn().mockReturnValue(false),
      currentUser: currentUserState,
      logout: vi.fn(),
    };

    authApiService = {
      getProfilePhoto: vi.fn().mockReturnValue(of(new Blob())),
    };

    routerEvents = new Subject<NavigationEnd>();

    router = {
      url: '/dashboard',
      events: routerEvents,
      navigate: vi.fn().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        { provide: Auth, useValue: auth },
        { provide: AuthApiService, useValue: authApiService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    routerEvents.complete();
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should logout and navigate to login', () => {
    component.logout();

    expect(auth.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should navigate to notifications', () => {
    component.openNotifications();

    expect(router.navigate).toHaveBeenCalledWith(['/notifications']);
  });

  it('should render the logout button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const logoutButton = compiled.querySelector('.logout-button');

    expect(logoutButton).toBeTruthy();
    expect(logoutButton?.textContent?.trim()).toBe('Logout');
  });

  it('should provide an accessible name for notifications', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const notificationButton = compiled.querySelector('.icon-button');

    expect(notificationButton?.getAttribute('aria-label')).toBe(
      'Notifications',
    );
  });

  it('should hide decorative navbar icons from screen readers', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const notificationIcon = compiled.querySelector('.icon-button span');
    const avatar = compiled.querySelector('.avatar');

    expect(notificationIcon?.getAttribute('aria-hidden')).toBe('true');
    expect(avatar?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should display the current page title', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h2')?.textContent?.trim()).toBe(
      'Dashboard',
    );
  });

  it('should update the page title after navigation', () => {
    routerEvents.next(
      new NavigationEnd(1, '/employees', '/employees'),
    );

    fixture.detectChanges();

    expect(component.pageTitle).toBe('Employees');

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h2')?.textContent?.trim()).toBe(
      'Employees',
    );
  });

  it('should display the first name and Administrator role instead of email', () => {
    currentUserState.set({
      userId: 1,
      organizationId: 1,
      email: 'rabin@example.com',
      role: 'ORG_ADMIN',
      firstName: 'Rabin',
      lastName: 'Samanta',
    });

    fixture.detectChanges();

    expect(component.displayName).toBe('Rabin');
    expect(component.displayRole).toBe('Administrator');

    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector('.user-info strong')?.textContent?.trim(),
    ).toBe('Rabin');

    expect(
      compiled.querySelector('.user-info span')?.textContent?.trim(),
    ).toBe('Administrator');

    expect(compiled.textContent).not.toContain('rabin@example.com');
  });

  it('should display the first name and Employee role instead of email', () => {
    currentUserState.set({
      userId: 2,
      organizationId: 1,
      email: 'employee@example.com',
      role: 'EMPLOYEE',
      firstName: 'Rahul',
      lastName: 'Kumar',
    });

    fixture.detectChanges();

    expect(component.displayName).toBe('Rahul');
    expect(component.displayRole).toBe('Employee');

    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector('.user-info strong')?.textContent?.trim(),
    ).toBe('Rahul');

    expect(
      compiled.querySelector('.user-info span')?.textContent?.trim(),
    ).toBe('Employee');

    expect(compiled.textContent).not.toContain('employee@example.com');
  });

  it('should not display the email when the first name is unavailable', () => {
    currentUserState.set({
      userId: 2,
      organizationId: 1,
      email: 'employee@example.com',
      role: 'EMPLOYEE',
    });

    fixture.detectChanges();

    expect(component.displayName).toBe('User');

    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector('.user-info strong')?.textContent?.trim(),
    ).toBe('User');

    expect(compiled.textContent).not.toContain('employee@example.com');
  });
});
