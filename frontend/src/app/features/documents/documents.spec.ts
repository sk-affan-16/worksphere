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

  it('should open the upload document form', () => {
    expect(
      component.isUploadDocumentOpen(),
    ).toBe(false);

    component.openUploadDocument();
    fixture.detectChanges();

    expect(
      component.isUploadDocumentOpen(),
    ).toBe(true);

    const form = fixture.nativeElement.querySelector(
      '.upload-document-card',
    );

    expect(form).toBeTruthy();
  });

  it('should close the upload document form', () => {
    component.openUploadDocument();
    fixture.detectChanges();

    expect(
      component.isUploadDocumentOpen(),
    ).toBe(true);

    component.closeUploadDocument();
    fixture.detectChanges();

    expect(
      component.isUploadDocumentOpen(),
    ).toBe(false);

    const form = fixture.nativeElement.querySelector(
      '.upload-document-card',
    );

    expect(form).toBeNull();
  });

  it('should validate required document fields when saving an empty form', () => {
    component.openUploadDocument();
    fixture.detectChanges();

    component.saveDocument();
    fixture.detectChanges();

    expect(
      component.uploadDocumentSubmitted(),
    ).toBe(true);

    expect(
      component.uploadDocumentForm.controls.name.touched,
    ).toBe(true);

    expect(
      component.uploadDocumentForm.controls.employee.touched,
    ).toBe(true);

    expect(
      component.uploadDocumentForm.controls.type.touched,
    ).toBe(true);

    expect(
      component.uploadDocumentForm.controls.uploadedDate.touched,
    ).toBe(true);

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(
      'Document name is required.',
    );

    expect(compiled.textContent).toContain(
      'Employee name is required.',
    );

    expect(compiled.textContent).toContain(
      'Document type is required.',
    );

    expect(compiled.textContent).toContain(
      'Uploaded date is required.',
    );

    expect(compiled.textContent).toContain(
      'Please select a file before saving.',
    );
  });

  it('should not save a valid form when no file is selected', () => {
    component.openUploadDocument();
    fixture.detectChanges();

    component.uploadDocumentForm.setValue({
      name: 'Passport',
      employee: 'Maya Sen',
      type: 'Identity',
      uploadedDate: '2026-10-13',
    });

    expect(
      component.uploadDocumentForm.valid,
    ).toBe(true);

    component.saveDocument();
    fixture.detectChanges();

    expect(
      component.isUploadDocumentOpen(),
    ).toBe(true);

    expect(
      component.filteredDocuments().length,
    ).toBe(5);
  });

  it('should select a file and display its name', () => {
    component.openUploadDocument();
    fixture.detectChanges();

    const file = new File(
      ['demo document'],
      'maya-passport.pdf',
      {
        type: 'application/pdf',
      },
    );

    const input = fixture.nativeElement.querySelector(
      '#document-file',
    ) as HTMLInputElement;

    expect(input).toBeTruthy();

    Object.defineProperty(input, 'files', {
      value: [file],
      configurable: true,
    });

    component.selectFile({
      target: input,
    } as unknown as Event);

    fixture.detectChanges();

    expect(
      component.selectedFileName(),
    ).toBe('maya-passport.pdf');

    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector('.selected-file')?.textContent?.trim(),
    ).toBe('Selected file: maya-passport.pdf');

    expect(compiled.textContent).toContain(
      'Selected file: maya-passport.pdf',
    );
  });

  it('should add a valid document to the repository', () => {
    component.openUploadDocument();
    fixture.detectChanges();

    const file = new File(
      ['demo document'],
      'maya-passport.pdf',
      {
        type: 'application/pdf',
      },
    );

    const input = fixture.nativeElement.querySelector(
      '#document-file',
    ) as HTMLInputElement;

    expect(input).toBeTruthy();

    Object.defineProperty(input, 'files', {
      value: [file],
      configurable: true,
    });

    component.selectFile({
      target: input,
    } as unknown as Event);

    component.uploadDocumentForm.setValue({
      name: 'Passport',
      employee: 'Maya Sen',
      type: 'Identity',
      uploadedDate: '2026-10-13',
    });

    expect(
      component.uploadDocumentForm.valid,
    ).toBe(true);

    expect(
      component.selectedFileName(),
    ).toBe('maya-passport.pdf');

    component.saveDocument();
    fixture.detectChanges();

    expect(
      component.isUploadDocumentOpen(),
    ).toBe(false);

    expect(
      component.filteredDocuments().length,
    ).toBe(6);

    expect(
      component.filteredDocuments()[5].name,
    ).toBe('Passport');

    expect(
      component.filteredDocuments()[5].employee,
    ).toBe('Maya Sen');

    expect(
      component.filteredDocuments()[5].type,
    ).toBe('Identity');

    expect(
      component.filteredDocuments()[5].uploadedDate,
    ).toBe('2026-10-13');

    expect(
      component.filteredDocuments()[5].status,
    ).toBe('Pending');

    expect(
      component.selectedFileName(),
    ).toBe('');

    expect(
      component.uploadDocumentForm.controls.name.value,
    ).toBe('');

    expect(
      component.uploadDocumentForm.controls.employee.value,
    ).toBe('');

    expect(
      component.uploadDocumentForm.controls.type.value,
    ).toBe('');

    expect(
      component.uploadDocumentForm.controls.uploadedDate.value,
    ).toBe('');

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(
      'Passport',
    );

    expect(compiled.textContent).toContain(
      'Maya Sen',
    );

    expect(compiled.textContent).toContain(
      'Pending',
    );
  });
});
