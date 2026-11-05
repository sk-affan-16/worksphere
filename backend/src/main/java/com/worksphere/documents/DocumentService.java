
package com.worksphere.documents;

import com.worksphere.employee.Employee;
import com.worksphere.employee.EmployeeRepository;
import com.worksphere.security.CurrentTenantService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    // Check whether the authenticated user is an organization admin.
    private boolean isOrganizationAdmin() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        return authentication != null
                && authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        "ROLE_ORG_ADMIN".equals(authority.getAuthority())
                );
    }

    // UPLOAD DOCUMENT - ADMIN ONLY
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

    // GET DOCUMENTS - ADMIN GETS ORGANIZATION DOCUMENTS,
    // EMPLOYEE GETS ONLY THEIR OWN DOCUMENTS.
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'EMPLOYEE')")
    public List<DocumentResponse> getAllDocuments() {

        if (isOrganizationAdmin()) {
            Long organizationId =
                    currentTenantService.getCurrentOrganizationId();

            return documentRepository
                    .findAllByEmployee_User_Organization_Id(organizationId)
                    .stream()
                    .map(DocumentMapper::toResponse)
                    .toList();
        }

        Long userId = currentTenantService.getCurrentUserId();

        return documentRepository
                .findAllByEmployee_User_Id(userId)
                .stream()
                .map(DocumentMapper::toResponse)
                .toList();
    }

    // GET SINGLE DOCUMENT - ROLE-SCOPED ACCESS
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'EMPLOYEE')")
    public DocumentResponse getDocumentById(Long documentId) {

        if (documentId == null || documentId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Valid document ID is required"
            );
        }

        Document document;

        if (isOrganizationAdmin()) {
            Long organizationId =
                    currentTenantService.getCurrentOrganizationId();

            document = documentRepository
                    .findByIdAndEmployee_User_Organization_Id(
                            documentId,
                            organizationId
                    )
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Document not found"
                    ));

        } else {
            Long userId = currentTenantService.getCurrentUserId();

            document = documentRepository
                    .findByIdAndEmployee_User_Id(
                            documentId,
                            userId
                    )
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Document not found"
                    ));
        }

        return DocumentMapper.toResponse(document);
    }

    // APPROVE OR REJECT DOCUMENT - ADMIN ONLY
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

    // DOWNLOAD DOCUMENT - ROLE-SCOPED ACCESS
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'EMPLOYEE')")
    public DownloadedDocument downloadDocument(Long documentId) {

        if (documentId == null || documentId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Valid document ID is required"
            );
        }

        Document document;

        if (isOrganizationAdmin()) {
            Long organizationId =
                    currentTenantService.getCurrentOrganizationId();

            document = documentRepository
                    .findByIdAndEmployee_User_Organization_Id(
                            documentId,
                            organizationId
                    )
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Document not found"
                    ));

        } else {
            Long userId = currentTenantService.getCurrentUserId();

            document = documentRepository
                    .findByIdAndEmployee_User_Id(
                            documentId,
                            userId
                    )
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Document not found"
                    ));
        }

        byte[] content = documentStorageService.load(
                document.getStorageKey()
        );

        return new DownloadedDocument(
                content,
                document.getOriginalFileName(),
                document.getContentType()
        );
    }

    public record DownloadedDocument(
            byte[] content,
            String fileName,
            String contentType
    ) {
    }
}
