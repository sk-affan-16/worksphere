import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should mark the form as touched when submitted while invalid', () => {
    component['loginForm'].setValue({
      email: '',
      password: '',
      rememberMe: false,
    });

    component['submit']();

    expect(
      component['loginForm'].controls.email.touched,
    ).toBe(true);

    expect(
      component['loginForm'].controls.password.touched,
    ).toBe(true);
  });

  it('should reject an invalid email address', () => {
    component['loginForm'].controls.email.setValue('abc');

    expect(
      component['loginForm'].controls.email.invalid,
    ).toBe(true);
  });

  it('should accept a valid email address', () => {
    component['loginForm'].controls.email.setValue(
      'test@example.com',
    );

    expect(
      component['loginForm'].controls.email.valid,
    ).toBe(true);
  });

  it('should toggle password visibility', () => {
    expect(component['showPassword']).toBe(false);

    component['togglePassword']();

    expect(component['showPassword']).toBe(true);

    component['togglePassword']();

    expect(component['showPassword']).toBe(false);
  });

  it('should show the loading state when submitting', () => {
    component.isSubmitting.set(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector('.login-loading'),
    ).toBeTruthy();

    expect(
      compiled.querySelector('.login-button')?.textContent,
    ).toContain('Signing in...');
  });

  it('should disable the login button while submitting', () => {
    component.isSubmitting.set(true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      '.login-button',
    ) as HTMLButtonElement;

    expect(button.disabled).toBe(true);
  });

  it('should display the login error when one exists', () => {
    component.loginError.set(
      'Invalid email or password.',
    );
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector('.login-status'),
    ).toBeTruthy();

    expect(compiled.textContent).toContain(
      'Invalid email or password.',
    );
  });
});
