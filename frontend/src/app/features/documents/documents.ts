import { Component, OnInit, computed, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { EmployeeResponse, EmployeeService } from '../employees/employee.service';
import { DocumentResponse, DocumentStatus, DocumentsService } from './documents.service';
import { EmptyState } from '../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-documents',
  imports: [FormsModule, ReactiveFormsModule, EmptyState],
  templateUrl: './documents.html',
  styleUrl: './documents.css',
})
export class Documents implements OnInit {
  readonly uploadDocumentForm;

  readonly employees = signal<EmployeeResponse[]>([]);
  readonly documents = signal<DocumentResponse[]>([]);

  readonly uploadDocumentSubmitted = signal(false);
  readonly isUploadDocumentOpen = signal(false);
  readonly selectedFileName = signal('');
  readonly selectedFile = signal<File | null>(null);

  readonly isLoading = signal(false);
  readonly isUploading = signal(false);
  readonly loadingEmployees = signal(false);
  readonly actionInProgress = signal<number | null>(null);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly searchTerm = signal('');
  readonly statusFilter = signal<'All' | DocumentStatus>('All');

  readonly filteredDocuments = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.documents().filter((document) => {
      const matchesSearch =
        !search ||
        document.name.toLowerCase().includes(search) ||
        document.employeeName.toLowerCase().includes(search) ||
        document.type.toLowerCase().includes(search) ||
        document.originalFileName.toLowerCase().includes(search);

      const matchesStatus = status === 'All' || document.status === status;

      return matchesSearch && matchesStatus;
    });
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly employeeService: EmployeeService,
    private readonly documentsService: DocumentsService,
  ) {
    this.uploadDocumentForm = this.formBuilder.nonNullable.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      employeeId: ['', [Validators.required]],
      type: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadDocuments();
  }

  loadEmployees(): void {
    this.loadingEmployees.set(true);

    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees.set(employees.filter((employee) => employee.status === 'ACTIVE'));
        this.loadingEmployees.set(false);
      },
      error: () => {
        this.loadingEmployees.set(false);
        this.errorMessage.set('Unable to load employees. Please refresh the page.');
      },
    });
  }

  loadDocuments(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.documentsService.getDocuments().subscribe({
      next: (documents) => {
        this.documents.set(documents);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Unable to load documents. Please try again.');
      },
    });
  }

  openUploadDocument(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.isUploadDocumentOpen.set(true);
  }

  closeUploadDocument(): void {
    if (this.isUploading()) {
      return;
    }

    this.isUploadDocumentOpen.set(false);
    this.resetUploadForm();
  }

  selectFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedFile.set(file);
    this.selectedFileName.set(file?.name ?? '');
    this.errorMessage.set('');
  }

  saveDocument(): void {
    this.uploadDocumentSubmitted.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.uploadDocumentForm.invalid || !this.selectedFile()) {
      this.uploadDocumentForm.markAllAsTouched();

      if (!this.selectedFile()) {
        this.errorMessage.set('Please select a document file.');
      }

      return;
    }

    const value = this.uploadDocumentForm.getRawValue();
    const employeeId = Number(value.employeeId);

    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      this.errorMessage.set('Please select a valid employee.');
      return;
    }

    const file = this.selectedFile();

    if (!file) {
      this.errorMessage.set('Please select a document file.');
      return;
    }

    this.isUploading.set(true);

    this.documentsService
      .uploadDocument(employeeId, value.name.trim(), value.type.trim(), file)
      .subscribe({
        next: (document) => {
          this.documents.update((current) => [document, ...current]);
          this.isUploading.set(false);
          this.isUploadDocumentOpen.set(false);
          this.resetUploadForm();
          this.successMessage.set('Document uploaded successfully.');
        },
        error: (error: unknown) => {
          this.isUploading.set(false);
          this.errorMessage.set(
            this.getErrorMessage(error, 'Document upload failed. Please try again.'),
          );
        },
      });
  }

  updateDocumentStatus(document: DocumentResponse, status: DocumentStatus): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.actionInProgress.set(document.id);

    this.documentsService.updateDocumentStatus(document.id, status).subscribe({
      next: (updatedDocument) => {
        this.documents.update((current) =>
          current.map((item) => (item.id === updatedDocument.id ? updatedDocument : item)),
        );

        this.actionInProgress.set(null);
        this.successMessage.set(`Document ${status.toLowerCase()} successfully.`);
      },
      error: (error: unknown) => {
        this.actionInProgress.set(null);
        this.errorMessage.set(this.getErrorMessage(error, 'Unable to update document status.'));
      },
    });
  }

  downloadDocument(document: DocumentResponse): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.actionInProgress.set(document.id);

    this.documentsService.downloadDocument(document.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = window.document.createElement('a');

        anchor.href = url;
        anchor.download = document.originalFileName || document.name;
        anchor.click();

        // Delay cleanup so the browser can start the download.
        window.setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);

        this.actionInProgress.set(null);
      },
      error: (error: unknown) => {
        this.actionInProgress.set(null);
        this.errorMessage.set(this.getErrorMessage(error, 'Unable to download this document.'));
      },
    });
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
  }

  updateStatus(value: string): void {
    if (value === 'All' || value === 'PENDING' || value === 'APPROVED' || value === 'REJECTED') {
      this.statusFilter.set(value);
    }
  }

  formatStatus(status: DocumentStatus): string {
    return status.charAt(0) + status.slice(1).toLowerCase();
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString();
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  protected trackDocument(_index: number, item: DocumentResponse): number {
    return item.id;
  }

  private resetUploadForm(): void {
    this.uploadDocumentForm.reset({
      name: '',
      employeeId: '',
      type: '',
    });

    this.selectedFile.set(null);
    this.selectedFileName.set('');
    this.uploadDocumentSubmitted.set(false);
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const response = error.error;

      if (
        typeof response === 'object' &&
        response !== null &&
        'message' in response &&
        typeof response.message === 'string'
      ) {
        return response.message;
      }
    }

    return fallback;
  }
}
