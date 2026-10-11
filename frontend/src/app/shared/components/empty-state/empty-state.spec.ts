import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  let component: EmptyState;
  let fixture: ComponentFixture<EmptyState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyState],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyState);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the default empty state', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector('h2')?.textContent?.trim(),
    ).toBe('No data available');

    expect(
      compiled.querySelector('p')?.textContent?.trim(),
    ).toBe('There is nothing to display yet.');

    expect(
      compiled.querySelector('.empty-state'),
    ).toBeTruthy();
  });

  it('should display custom title and message', () => {
    fixture.componentRef.setInput(
      'title',
      'No employees found',
    );

    fixture.componentRef.setInput(
      'message',
      'Try changing your search or filters.',
    );

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector('h2')?.textContent?.trim(),
    ).toBe('No employees found');

    expect(
      compiled.querySelector('p')?.textContent?.trim(),
    ).toBe('Try changing your search or filters.');
  });

  it('should provide an accessible label for the empty state', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const emptyState = compiled.querySelector('.empty-state');

    expect(
      emptyState?.getAttribute('aria-label'),
    ).toBe('Empty state');
  });

  it('should hide the decorative icon from screen readers', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('.empty-icon');

    expect(
      icon?.getAttribute('aria-hidden'),
    ).toBe('true');
  });
});
