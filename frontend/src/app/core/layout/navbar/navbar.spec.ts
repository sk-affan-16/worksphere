import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { Auth } from '../../auth/auth';
import { Navbar } from './navbar';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  let auth: {
    logout: ReturnType<typeof vi.fn>;
  };

  let router: {
    url: string;
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    auth = {
      logout: vi.fn(),
    };

    router = {
      url: '/dashboard',
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

  it('should render the logout button', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const logoutButton = compiled.querySelector('.logout-button');

    expect(logoutButton).toBeTruthy();
    expect(logoutButton?.textContent?.trim()).toBe('Logout');
  });

  it('should display the current page title', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h2')?.textContent?.trim())
      .toBe('Dashboard');
  });

  it('should return the employee page title', () => {
    router.url = '/employees';

    expect(component.pageTitle).toBe('Employees');
  });
});
