import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingSpinner } from './loading-spinner';

describe('LoadingSpinner', () => {
  let component: LoadingSpinner;
  let fixture: ComponentFixture<LoadingSpinner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSpinner],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSpinner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the default loading label', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector('.loading-container')?.textContent,
    ).toContain('Loading...');
  });

  it('should display a custom loading label', () => {
    fixture.componentRef.setInput(
      'label',
      'Loading employees...',
    );
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector('.loading-container')?.textContent,
    ).toContain('Loading employees...');
  });

  it('should expose the loading message as a status', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const loadingContainer =
      compiled.querySelector('.loading-container');

    expect(
      loadingContainer?.getAttribute('role'),
    ).toBe('status');

    expect(
      loadingContainer?.getAttribute('aria-live'),
    ).toBe('polite');
  });

  it('should hide the decorative spinner from screen readers', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const spinner = compiled.querySelector('.spinner');

    expect(
      spinner?.getAttribute('aria-hidden'),
    ).toBe('true');
  });
});
