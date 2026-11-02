
package com.worksphere.documents;

import com.worksphere.employee.Employee;
import com.worksphere.employee.EmployeeRepository;
import com.worksphere.security.CurrentTenantService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final EmployeeRepository employeeRepository;
    private final CurrentTenantService currentTenantService;
    private final DocumentStorageService documentStorageService;

    public DocumentService(
            DocumentRepository documentRepository,
            EmployeeRepository employeeRepository,
            CurrentTenantService currentTenantService,
            DocumentStorageService documentStorageService
    ) {
        this.documentRepository = documentRepository;
        this.employeeRepository = employeeRepository;
        this.currentTenantService = currentTenantService;
        this.documentStorageService = documentStorageService;
    }

    // UPLOAD DOCUMENT
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public DocumentResponse uploadDocument(
            Long employeeId,
            String name,
            String type,
            MultipartFile file
    ) {
        if (employeeId == null || employeeId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Valid employee ID is required"
            );
        }

        if (name == null || name.isBlank() || name.trim().length() > 150) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Document name is required and must not exceed 150 characters"
            );
        }

        if (type == null || type.isBlank() || type.trim().length() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Document type is required and must not exceed 100 characters"
            );
        }

        Long organizationId =
                currentTenantService.getCurrentOrganizationId();

        Employee employee = employeeRepository
                .findByIdAndUser_Organization_Id(
                        employeeId,
                        organizationId
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found"
                ));

        DocumentStorageService.StoredDocument storedDocument =
                documentStorageService.store(file);

        try {
            Document document = new Document(
                    employee,
                    name,
                    type,
                    storedDocument.originalFileName(),
                    storedDocument.storageKey(),
                    storedDocument.contentType(),
                    storedDocument.fileSize()
            );

            Document savedDocument =
                    documentRepository.saveAndFlush(document);

            return DocumentMapper.toResponse(savedDocument);

        } catch (RuntimeException exception) {
            try {
                documentStorageService.delete(
                        storedDocument.storageKey()
                );
            } catch (RuntimeException cleanupException) {
                exception.addSuppressed(cleanupException);
            }

            throw exception;
        }
    }

    // GET ALL DOCUMENTS FOR CURRENT ORGANIZATION
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public List<DocumentResponse> getAllDocuments() {

        Long organizationId =
                currentTenantService.getCurrentOrganizationId();

        return documentRepository
                .findAllByEmployee_User_Organization_Id(organizationId)
                .stream()
                .map(DocumentMapper::toResponse)
                .toList();
    }

    // GET SINGLE DOCUMENT
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public DocumentResponse getDocumentById(Long documentId) {

        if (documentId == null || documentId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Valid document ID is required"
            );
        }

        Long organizationId =
                currentTenantService.getCurrentOrganizationId();

        Document document = documentRepository
                .findByIdAndEmployee_User_Organization_Id(
                        documentId,
                        organizationId
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Document not found"
                ));

        return DocumentMapper.toResponse(document);
    }

    // APPROVE OR REJECT DOCUMENT
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public DocumentResponse updateDocumentStatus(
            Long documentId,
            Document.Status status
    ) {

        if (documentId == null || documentId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Valid document ID is required"
            );
        }

        Long organizationId =
                currentTenantService.getCurrentOrganizationId();

        Document document = documentRepository
                .findByIdAndEmployee_User_Organization_Id(
                        documentId,
                        organizationId
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Document not found"
                ));

        try {
            document.review(status);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
            );
        }

        return DocumentMapper.toResponse(document);
    }

    // DOWNLOAD DOCUMENT FILE
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public DownloadedDocument downloadDocument(Long documentId) {

        if (documentId == null || documentId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Valid document ID is required"
            );
        }

        Long organizationId =
                currentTenantService.getCurrentOrganizationId();

        Document document = documentRepository
                .findByIdAndEmployee_User_Organization_Id(
                        documentId,
                        organizationId
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Document not found"
                ));

        byte[] content = documentStorageService.load(
                document.getStorageKey()
        );

        return new DownloadedDocument(
                content,
                document.getOriginalFileName(),
                document.getContentType()
        );
    }

    // DOWNLOAD RESPONSE DATA
    public record DownloadedDocument(
            byte[] content,
            String fileName,
            String contentType
    ) {
    }
}
