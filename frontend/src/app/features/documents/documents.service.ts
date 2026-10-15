import { Injectable, signal } from '@angular/core';

export type DocumentStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected';

export interface DocumentRecord {
  name: string;
  employee: string;
  type: string;
  uploadedDate: string;
  status: DocumentStatus;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentsService {
  private readonly storageKey =
    'worksphere_documents';

  private readonly documents =
    signal<DocumentRecord[]>(
      this.loadDocuments(),
    );

  readonly documentList =
    this.documents.asReadonly();

  addDocument(
    document: DocumentRecord,
  ): void {
    this.documents.update((documents) => {
      const updatedDocuments = [
        ...documents,
        document,
      ];

      this.saveDocuments(updatedDocuments);

      return updatedDocuments;
    });
  }

  private loadDocuments(): DocumentRecord[] {
    const storedDocuments = localStorage.getItem(
      this.storageKey,
    );

    if (!storedDocuments) {
      return this.getDefaultDocuments();
    }

    try {
      const parsedDocuments = JSON.parse(
        storedDocuments,
      );

      if (Array.isArray(parsedDocuments)) {
        return parsedDocuments as DocumentRecord[];
      }
    } catch {
      // Fall back to the default demo data.
    }

    return this.getDefaultDocuments();
  }

  private saveDocuments(
    documents: DocumentRecord[],
  ): void {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify(documents),
    );
  }

  private getDefaultDocuments(): DocumentRecord[] {
    return [
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
  }
}
