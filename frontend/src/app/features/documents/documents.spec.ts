import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Documents } from './documents';

describe('Documents', () => {
  let component: Documents;
  let fixture: ComponentFixture<Documents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Documents],
    }).compileComponents();

    fixture = TestBed.createComponent(Documents);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render document records', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const rows = compiled.querySelectorAll('tbody tr');

    expect(rows.length).toBe(5);
  });

  it('should filter documents by employee name', () => {
    component.updateSearch('Priya');

    expect(component.filteredDocuments().length).toBe(1);
    expect(component.filteredDocuments()[0].employee).toBe('Priya Das');
  });

  it('should filter documents by status', () => {
    component.updateStatus('Approved');

    expect(component.filteredDocuments().length).toBe(2);
  });
});
