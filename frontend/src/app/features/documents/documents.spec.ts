import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { Documents } from './documents';
import { DocumentsService } from './documents.service';
import { EmployeeService } from '../employees/employee.service';

describe('Documents', () => {
  let fixture: ComponentFixture<Documents>;
  let component: Documents;

  const employee = {
    id: 1,
    userId: 10,
    firstName: 'Maya',
    lastName: 'Sen',
    email: 'maya@example.com',
    phone: null,
    jobTitle: 'Developer',
    department: 'IT',
    hireDate: '2026-01-01',
    status: 'ACTIVE' as const,
  };

  const document = {
    id: 1,
    employeeId: 1,
    employeeName: 'Maya Sen',
    name: 'Passport',
    type: 'Identity',
    originalFileName: 'passport.pdf',
    contentType: 'application/pdf',
    fileSize: 1024,
    status: 'PENDING' as const,
    uploadedAt: '2026-10-13T10:00:00Z',
    reviewedAt: null,
  };

  const documentsService = {
    getDocuments: vi.fn(),
    uploadDocument: vi.fn(),
    updateDocumentStatus: vi.fn(),
    downloadDocument: vi.fn(),
  };

  const employeeService = {
    getEmployees: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    documentsService.getDocuments.mockReturnValue(of([document]));
    employeeService.getEmployees.mockReturnValue(of([employee]));

    documentsService.uploadDocument.mockReturnValue(of(document));

    documentsService.updateDocumentStatus.mockReturnValue(
      of({
        ...document,
        status: 'APPROVED',
      }),
    );

    documentsService.downloadDocument.mockReturnValue(
      of(new Blob(['test'], { type: 'application/pdf' })),
    );

    await TestBed.configureTestingModule({
      imports: [Documents],
      providers: [
        { provide: DocumentsService, useValue: documentsService },
        { provide: EmployeeService, useValue: employeeService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Documents);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load employees and documents from their services', () => {
    expect(employeeService.getEmployees).toHaveBeenCalled();
    expect(documentsService.getDocuments).toHaveBeenCalled();

    expect(component.employees().length).toBe(1);
    expect(component.documents().length).toBe(1);
  });

  it('should filter documents by employee name', () => {
    component.updateSearch('Maya');

    expect(component.filteredDocuments().length).toBe(1);
  });

  it('should filter documents by status', () => {
    component.updateStatus('PENDING');

    expect(component.filteredDocuments().length).toBe(1);

    component.updateStatus('APPROVED');

    expect(component.filteredDocuments().length).toBe(0);
  });

  it('should open and close the upload form', () => {
    component.openUploadDocument();

    expect(component.isUploadDocumentOpen()).toBe(true);

    component.closeUploadDocument();

    expect(component.isUploadDocumentOpen()).toBe(false);
  });

  it('should upload a selected file using the API service', () => {
    const file = new File(['document'], 'passport.pdf', {
      type: 'application/pdf',
    });

    component.uploadDocumentForm.setValue({
      name: 'Passport',
      employeeId: '1',
      type: 'Identity',
    });

    component.selectFile({
      target: {
        files: [file],
      },
    } as unknown as Event);

    component.saveDocument();

    expect(documentsService.uploadDocument).toHaveBeenCalledWith(1, 'Passport', 'Identity', file);

    expect(component.documents().length).toBe(2);
  });

  it('should not upload when the form is invalid', () => {
    component.saveDocument();

    expect(documentsService.uploadDocument).not.toHaveBeenCalled();
  });

  it('should update document status through the API service', () => {
    component.updateDocumentStatus(document, 'APPROVED');

    expect(documentsService.updateDocumentStatus).toHaveBeenCalledWith(1, 'APPROVED');

    expect(component.documents()[0].status).toBe('APPROVED');
  });

  it('should display an error when documents cannot be loaded', () => {
    documentsService.getDocuments.mockReturnValue(throwError(() => new Error('Server error')));

    component.loadDocuments();

    expect(component.errorMessage()).toBe('Unable to load documents. Please try again.');
  });

  it('should display an error when document upload fails', () => {
    documentsService.uploadDocument.mockReturnValue(throwError(() => new Error('Upload failed')));

    const file = new File(['document'], 'passport.pdf', {
      type: 'application/pdf',
    });

    component.uploadDocumentForm.setValue({
      name: 'Passport',
      employeeId: '1',
      type: 'Identity',
    });

    component.selectFile({
      target: {
        files: [file],
      },
    } as unknown as Event);

    component.saveDocument();

    expect(component.errorMessage()).toBe('Document upload failed. Please try again.');
  });
});
