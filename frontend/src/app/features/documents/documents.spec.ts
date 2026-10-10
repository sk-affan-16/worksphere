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
    expect(component.filteredDocuments()[0].employee).toBe(
      'Priya Das',
    );
  });

  it('should filter documents by status', () => {
    component.updateStatus('Approved');

    expect(component.filteredDocuments().length).toBe(2);
  });

  it('should label the document repository table', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const table = compiled.querySelector('table');
    const heading = compiled.querySelector(
      '#document-repository-title',
    );

    expect(heading?.textContent?.trim()).toBe(
      'Document Repository',
    );

    expect(
      table?.getAttribute('aria-labelledby'),
    ).toBe('document-repository-title');
  });

  it('should mark document table headers as column headers', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const headers = Array.from(
      compiled.querySelectorAll('thead th'),
    );

    expect(headers.length).toBe(5);
    expect(
      headers.every(
        (header) => header.getAttribute('scope') === 'col',
      ),
    ).toBe(true);
  });

  it('should display the empty state when no documents match the filter', () => {
    component.updateSearch('document-that-does-not-exist');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector('app-empty-state'),
    ).toBeTruthy();

    expect(compiled.textContent).toContain(
      'No documents found',
    );
  });
});
