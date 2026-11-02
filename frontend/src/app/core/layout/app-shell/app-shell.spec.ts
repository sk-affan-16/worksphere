
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Auth } from '../../auth/auth';
import {
  AuthApiService,
  CurrentUserResponse,
} from '../../auth/auth-api.service';
import { AppShell } from './app-shell';

describe('AppShell', () => {
  let authenticated: boolean;
  let currentUser: CurrentUserResponse | null;

  let auth: {
    isAuthenticated: ReturnType<typeof vi.fn>;
    currentUser: ReturnType<typeof vi.fn>;
    role: () => 'ORG_ADMIN' | 'EMPLOYEE' | null;
    setCurrentUser: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };

  let authApiService: {
    getCurrentUser: ReturnType<typeof vi.fn>;
    getProfilePhoto: ReturnType<typeof vi.fn>;
  };

  const adminUser: CurrentUserResponse = {
    userId: 1,
    organizationId: 1,
    email: 'admin@worksphere.local',
    role: 'ORG_ADMIN',
    firstName: 'WorkSphere',
    lastName: 'Admin',
  };

  beforeEach(async () => {
    authenticated = true;
    currentUser = null;

    auth = {
      isAuthenticated: vi.fn(() => authenticated),
      currentUser: vi.fn(() => currentUser),
      role: vi.fn(() => currentUser?.role ?? null),
      setCurrentUser: vi.fn((user: CurrentUserResponse) => {
        currentUser = user;
      }),
      logout: vi.fn(() => {
        authenticated = false;
        currentUser = null;
      }),
    };

    authApiService = {
      getCurrentUser: vi.fn().mockReturnValue(of(adminUser)),
      getProfilePhoto: vi.fn().mockReturnValue(of(new Blob())),
    };

    await TestBed.configureTestingModule({
      imports: [AppShell],
      providers: [
        provideRouter([]),
        {
          provide: Auth,
          useValue: auth,
        },
        {
          provide: AuthApiService,
          useValue: authApiService,
        },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AppShell);

    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should label the main content area for accessibility', () => {
    const fixture = TestBed.createComponent(AppShell);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const main = compiled.querySelector('main.content-area');

    expect(main?.getAttribute('aria-label')).toBe(
      'Main content',
    );
  });

  it('should provide a skip link to the main content', () => {
    const fixture = TestBed.createComponent(AppShell);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const skipLink =
      compiled.querySelector<HTMLAnchorElement>('.skip-link');

    expect(skipLink).toBeTruthy();

    expect(skipLink?.textContent?.trim()).toBe(
      'Skip to main content',
    );

    expect(skipLink?.getAttribute('href')).toBe(
      '#main-content',
    );

    expect(
      compiled.querySelector('#main-content'),
    ).toBeTruthy();
  });

  it('should load the authenticated user profile after browser refresh', () => {
    const fixture = TestBed.createComponent(AppShell);

    fixture.detectChanges();

    expect(authApiService.getCurrentUser).toHaveBeenCalledTimes(1);

    expect(auth.setCurrentUser).toHaveBeenCalledWith(adminUser);

    expect(currentUser).toEqual(adminUser);
    expect(auth.role()).toBe('ORG_ADMIN');
  });

  it('should not request the profile when the user is unauthenticated', () => {
    authenticated = false;

    const fixture = TestBed.createComponent(AppShell);

    fixture.detectChanges();

    expect(authApiService.getCurrentUser).not.toHaveBeenCalled();
  });

  it('should not request the profile again when the user is already loaded', () => {
    currentUser = adminUser;

    const fixture = TestBed.createComponent(AppShell);

    fixture.detectChanges();

    expect(authApiService.getCurrentUser).not.toHaveBeenCalled();
  });

  it('should clear an expired session and navigate to login', () => {
    authApiService.getCurrentUser.mockReturnValueOnce(
      throwError(
        () => new HttpErrorResponse({ status: 401 }),
      ),
    );

    const router = TestBed.inject(Router);
    const navigateSpy = vi
      .spyOn(router, 'navigate')
      .mockResolvedValue(true);

    const fixture = TestBed.createComponent(AppShell);

    fixture.detectChanges();

    expect(auth.logout).toHaveBeenCalledTimes(1);

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
