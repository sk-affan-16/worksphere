import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { EmptyState } from '../../shared/components/empty-state/empty-state';

type DocumentStatus = 'Pending' | 'Approved' | 'Rejected';

interface DemoDocument {
  name: string;
  employee: string;
  type: string;
  uploadedDate: string;
  status: DocumentStatus;
}

@Component({
  selector: 'app-documents',
  imports: [FormsModule, EmptyState],
  templateUrl: './documents.html',
  styleUrl: './documents.css',
})
export class Documents {
  readonly searchTerm = signal('');
  readonly statusFilter = signal<'All' | DocumentStatus>('All');

  /*
   * Temporary frontend demo data.
   * This is not the backend documents API contract.
   */
  private readonly demoDocuments: DemoDocument[] = [
    {
      name: 'Aadhaar Card',
      employee: 'Aarav Sharma',
      type: 'Identity',
      uploadedDate: '2026-09-15',
      status: 'Approved',
    },
    {
      name: 'Offer Letter',
      employee: 'Priya Das',
      type: 'Employment',
      uploadedDate: '2026-09-22',
      status: 'Approved',
    },
    {
      name: 'PAN Card',
      employee: 'Rahul Verma',
      type: 'Identity',
      uploadedDate: '2026-09-29',
      status: 'Pending',
    },
    {
      name: 'Bank Details',
      employee: 'Sneha Patel',
      type: 'Financial',
      uploadedDate: '2026-10-06',
      status: 'Rejected',
    },
    {
      name: 'Experience Certificate',
      employee: 'Vikram Singh',
      type: 'Employment',
      uploadedDate: '2026-10-07',
      status: 'Pending',
    },
  ];

  readonly filteredDocuments = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.demoDocuments.filter((document) => {
      const matchesSearch =
        !search ||
        document.name.toLowerCase().includes(search) ||
        document.employee.toLowerCase().includes(search) ||
        document.type.toLowerCase().includes(search);

      const matchesStatus =
        status === 'All' || document.status === status;

      return matchesSearch && matchesStatus;
    });
  });

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
    item: DemoDocument,
  ): string {
    return `${item.employee}-${item.name}`;
  }
}