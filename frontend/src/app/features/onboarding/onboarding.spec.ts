import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Onboarding } from './onboarding';

describe('Onboarding', () => {
  let component: Onboarding;
  let fixture: ComponentFixture<Onboarding>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Onboarding],
    }).compileComponents();

    fixture = TestBed.createComponent(Onboarding);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render onboarding records', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const rows = compiled.querySelectorAll('tbody tr');

    expect(rows.length).toBe(4);
  });

  it('should filter onboarding records by employee name', () => {
    component.updateSearch('Priya');

    expect(component.filteredOnboarding().length).toBe(1);
    expect(component.filteredOnboarding()[0].employee)
      .toBe('Priya Das');
  });

  it('should filter onboarding records by status', () => {
    component.updateStatus('Completed');

    expect(component.filteredOnboarding().length).toBe(1);
    expect(component.filteredOnboarding()[0].employee)
      .toBe('Aarav Sharma');
  });
});
