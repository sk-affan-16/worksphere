import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppShell } from './app-shell';

describe('AppShell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShell],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AppShell);

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
});
