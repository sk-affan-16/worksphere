import { TestBed } from '@angular/core/testing';

import {
  DocumentRecord,
  DocumentsService,
} from './documents.service';

describe('DocumentsService', () => {
  const storageKey = 'worksphere_documents';

  beforeEach(() => {
    localStorage.removeItem(storageKey);

    TestBed.configureTestingModule({
      providers: [DocumentsService],
    });
  });

  afterEach(() => {
    localStorage.removeItem(storageKey);
    TestBed.resetTestingModule();
  });

  it('should create the service', () => {
    const service = TestBed.inject(DocumentsService);

    expect(service).toBeTruthy();
  });

  it('should load the default documents when storage is empty', () => {
    const service = TestBed.inject(DocumentsService);

    expect(service.documentList().length).toBe(5);
  });

  it('should add a document to the document list', () => {
    const service = TestBed.inject(DocumentsService);

    const newDocument: DocumentRecord = {
      name: 'Passport',
      employee: 'Maya Sen',
      type: 'Identity',
      uploadedDate: '2026-10-13',
      status: 'Pending',
    };

    service.addDocument(newDocument);

    expect(service.documentList().length).toBe(6);
    expect(service.documentList()[5]).toEqual(
      newDocument,
    );
  });

  it('should persist a newly added document to localStorage', () => {
    const service = TestBed.inject(DocumentsService);

    const newDocument: DocumentRecord = {
      name: 'Passport',
      employee: 'Maya Sen',
      type: 'Identity',
      uploadedDate: '2026-10-13',
      status: 'Pending',
    };

    service.addDocument(newDocument);

    const storedDocuments = JSON.parse(
      localStorage.getItem(storageKey) ?? '[]',
    ) as DocumentRecord[];

    expect(storedDocuments.length).toBe(6);
    expect(storedDocuments[5]).toEqual(newDocument);
  });

  it('should load previously stored documents', () => {
    const storedDocuments: DocumentRecord[] = [
      {
        name: 'Stored Document',
        employee: 'Maya Sen',
        type: 'Employment',
        uploadedDate: '2026-10-14',
        status: 'Approved',
      },
    ];

    localStorage.setItem(
      storageKey,
      JSON.stringify(storedDocuments),
    );

    const service = TestBed.inject(DocumentsService);

    expect(service.documentList()).toEqual(
      storedDocuments,
    );
  });

  it('should preserve document status values when loading stored data', () => {
    const storedDocuments: DocumentRecord[] = [
      {
        name: 'Rejected Document',
        employee: 'Maya Sen',
        type: 'Financial',
        uploadedDate: '2026-10-15',
        status: 'Rejected',
      },
    ];

    localStorage.setItem(
      storageKey,
      JSON.stringify(storedDocuments),
    );

    const service = TestBed.inject(DocumentsService);

    expect(service.documentList()[0].status).toBe(
      'Rejected',
    );
  });

  it('should fall back to default documents when stored data is invalid', () => {
    localStorage.setItem(
      storageKey,
      'invalid-json',
    );

    const service = TestBed.inject(DocumentsService);

    expect(service.documentList().length).toBe(5);
  });
});
