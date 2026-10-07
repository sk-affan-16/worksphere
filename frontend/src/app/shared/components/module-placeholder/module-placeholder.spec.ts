import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { ModulePlaceholder } from './module-placeholder';

describe('ModulePlaceholder', () => {
  let component: ModulePlaceholder;
  let fixture: ComponentFixture<ModulePlaceholder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModulePlaceholder],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                title: 'Test Module',
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModulePlaceholder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the route title', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent?.trim())
      .toBe('Test Module');
  });
});
