import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { Auth } from '../../auth/auth';
import { Navbar } from './navbar';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  let auth: {
    logout: ReturnType<typeof vi.fn>;
  };

  let routerEvents: Subject<NavigationEnd>;

  let router: {
    url: string;
    events: Subject<NavigationEnd>;
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    auth = {
      logout: vi.fn(),
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
        {
          provide: Auth,
          useValue: auth,
        },
        {
          provide: Router,
          useValue: router,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
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

    expect(router.navigate).toHaveBeenCalledWith([
      '/notifications',
    ]);
  });

  it('should render the logout button', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const logoutButton =
      compiled.querySelector('.logout-button');

    expect(logoutButton).toBeTruthy();
    expect(logoutButton?.textContent?.trim()).toBe('Logout');
  });

  it('should display the current page title', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector('h2')?.textContent?.trim(),
    ).toBe('Dashboard');
  });

  it('should update the page title after navigation', () => {
    routerEvents.next(
      new NavigationEnd(
        1,
        '/employees',
        '/employees',
      ),
    );

    fixture.detectChanges();

    expect(component.pageTitle).toBe('Employees');
  });
});
