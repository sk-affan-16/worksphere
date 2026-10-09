import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all navigation links', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll(
      '.navigation .nav-item',
    );

    expect(links.length).toBe(8);
  });

  it('should contain the correct navigation routes', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(
      compiled.querySelectorAll<HTMLAnchorElement>(
        '.navigation .nav-item',
      ),
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
});
