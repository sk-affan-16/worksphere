import { Component, computed, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { EmptyState } from '../../shared/components/empty-state/empty-state';
import {
  DocumentRecord,
  DocumentStatus,
  DocumentsService,
} from './documents.service';

@Component({
  selector: 'app-documents',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    EmptyState,
  ],
  templateUrl: './documents.html',
  styleUrl: './documents.css',
})
export class Documents {
  readonly uploadDocumentForm;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly documentsService: DocumentsService,
  ) {
    this.uploadDocumentForm =
      this.formBuilder.nonNullable.group({
        name: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
          ],
        ],
        employee: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
          ],
        ],
        type: [
          '',
          [Validators.required],
        ],
        uploadedDate: [
          '',
          [Validators.required],
        ],
      });
  }

  readonly uploadDocumentSubmitted = signal(false);
  readonly isUploadDocumentOpen = signal(false);
  readonly selectedFileName = signal('');

  readonly searchTerm = signal('');
  readonly statusFilter =
    signal<'All' | DocumentStatus>('All');

  readonly filteredDocuments = computed(() => {
    const search =
      this.searchTerm().trim().toLowerCase();

    const status = this.statusFilter();

    return this.documentsService
      .documentList()
      .filter((document) => {
        const matchesSearch =
          !search ||
          document.name
            .toLowerCase()
            .includes(search) ||
          document.employee
            .toLowerCase()
            .includes(search) ||
          document.type
            .toLowerCase()
            .includes(search);

        const matchesStatus =
          status === 'All' ||
          document.status === status;

        return matchesSearch && matchesStatus;
      });
  });

  openUploadDocument(): void {
    this.uploadDocumentSubmitted.set(false);
    this.isUploadDocumentOpen.set(true);
  }

  closeUploadDocument(): void {
    this.uploadDocumentSubmitted.set(false);

    this.uploadDocumentForm.reset({
      name: '',
      employee: '',
      type: '',
      uploadedDate: '',
    });

    this.selectedFileName.set('');
    this.isUploadDocumentOpen.set(false);
  }

  selectFile(event: Event): void {
    const input = event.target as HTMLInputElement;

    const file = input.files?.[0];

    this.selectedFileName.set(file?.name ?? '');
  }

  saveDocument(): void {
    this.uploadDocumentSubmitted.set(true);

    if (
      this.uploadDocumentForm.invalid ||
      !this.selectedFileName()
    ) {
      this.uploadDocumentForm.markAllAsTouched();
      return;
    }

    const formValue =
      this.uploadDocumentForm.getRawValue();

    const document: DocumentRecord = {
      name: formValue.name.trim(),
      employee: formValue.employee.trim(),
      type: formValue.type.trim(),
      uploadedDate: formValue.uploadedDate,
      status: 'Pending',
    };

    this.documentsService.addDocument(document);

    this.uploadDocumentForm.reset({
      name: '',
      employee: '',
      type: '',
      uploadedDate: '',
    });

    this.selectedFileName.set('');
    this.uploadDocumentSubmitted.set(false);
    this.isUploadDocumentOpen.set(false);
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
  }

  updateStatus(value: string): void {
    if (
      value === 'All' ||
      value === 'Pending' ||
      value === 'Approved' ||
      value === 'Rejected'
    ) {
      this.statusFilter.set(value);
    }
  }

  protected trackDocument(
    _index: number,
    item: DocumentRecord,
  ): string {
    return `${item.employee}-${item.name}`;
  }
}
