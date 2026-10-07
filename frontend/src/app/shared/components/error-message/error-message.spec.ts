import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorMessage } from './error-message';

describe('ErrorMessage', () => {
  let component: ErrorMessage;
  let fixture: ComponentFixture<ErrorMessage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorMessage],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorMessage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the default error message', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.error-container'))
      .toBeTruthy();

    expect(compiled.querySelector('strong')?.textContent?.trim())
      .toBe('Something went wrong');

    expect(compiled.querySelector('p')?.textContent?.trim())
      .toBe('Something went wrong.');
  });
});
