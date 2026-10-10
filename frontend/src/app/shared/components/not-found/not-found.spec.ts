import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NotFound } from './not-found';

describe('NotFound', () => {
  let component: NotFound;
  let fixture: ComponentFixture<NotFound>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFound],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFound);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the page not found message', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector('.error-code')?.textContent?.trim(),
    ).toBe('404');

    expect(
      compiled.querySelector('h1')?.textContent?.trim(),
    ).toBe('Page not found');

    expect(
      compiled.querySelector('.dashboard-button'),
    ).toBeTruthy();
  });

  it('should render the page inside the main landmark', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const main = compiled.querySelector('main.not-found-page');

    expect(main).toBeTruthy();
    expect(main?.querySelector('h1')).toBeTruthy();
  });

  it('should link back to the dashboard', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const dashboardLink =
      compiled.querySelector<HTMLAnchorElement>(
        '.dashboard-button',
      );

    expect(dashboardLink?.getAttribute('href')).toBe(
      '/dashboard',
    );

    expect(
      dashboardLink?.textContent?.trim(),
    ).toBe('Return to Dashboard');
  });
});
