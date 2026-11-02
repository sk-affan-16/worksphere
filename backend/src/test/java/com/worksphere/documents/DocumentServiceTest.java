
package com.worksphere.documents;

import com.worksphere.employee.Employee;
import com.worksphere.employee.EmployeeRepository;
import com.worksphere.security.CurrentTenantService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private CurrentTenantService currentTenantService;

    @Mock
    private DocumentStorageService documentStorageService;

    private DocumentService documentService;

    private Employee employee;

    @BeforeEach
    void setUp() {
        documentService = new DocumentService(
                documentRepository,
                employeeRepository,
                currentTenantService,
                documentStorageService
        );

        employee = mock(Employee.class);
    }

    private MockMultipartFile validFile() {
        return new MockMultipartFile(
                "file",
                "identity.pdf",
                "application/pdf",
                new byte[]{1, 2, 3}
        );
    }

    private DocumentStorageService.StoredDocument storedDocument() {
        return new DocumentStorageService.StoredDocument(
                "123e4567-e89b-12d3-a456-426614174000.pdf",
                "identity.pdf",
                "application/pdf",
                3L
        );
    }

    // --------------------------------------------------
    // DOCUMENT UPLOAD TESTS
    // --------------------------------------------------

    @Test
    void uploadDocumentShouldSaveDocumentForCurrentOrganization() {

        when(employee.getId()).thenReturn(10L);
        when(employee.getFirstName()).thenReturn("Test");
        when(employee.getLastName()).thenReturn("Employee");

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(5L);

        when(employeeRepository.findByIdAndUser_Organization_Id(10L, 5L))
                .thenReturn(Optional.of(employee));

        when(documentStorageService.store(any()))
                .thenReturn(storedDocument());

        when(documentRepository.saveAndFlush(any(Document.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        DocumentResponse response = documentService.uploadDocument(
                10L,
                "Identity Proof",
                "IDENTITY",
                validFile()
        );

        assertNotNull(response);
        assertEquals(10L, response.employeeId());
        assertEquals("Test Employee", response.employeeName());
        assertEquals("Identity Proof", response.name());
        assertEquals("IDENTITY", response.type());
        assertEquals("identity.pdf", response.originalFileName());
        assertEquals("application/pdf", response.contentType());
        assertEquals(Document.Status.PENDING, response.status());

        verify(employeeRepository)
                .findByIdAndUser_Organization_Id(10L, 5L);

        verify(documentStorageService).store(any());

        verify(documentRepository).saveAndFlush(any(Document.class));

        verify(documentStorageService, never()).delete(anyString());
    }

    @Test
    void uploadDocumentShouldRejectInvalidEmployeeId() {

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> documentService.uploadDocument(
                        0L, "Identity", "IDENTITY", validFile()
                )
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());

        verifyNoInteractions(
                employeeRepository,
                documentStorageService,
                documentRepository,
                currentTenantService
        );
    }

    @Test
    void uploadDocumentShouldRejectNullEmployeeId() {

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> documentService.uploadDocument(
                        null, "Identity", "IDENTITY", validFile()
                )
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());

        verifyNoInteractions(employeeRepository, documentStorageService);
    }

    @Test
    void uploadDocumentShouldRejectBlankName() {

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> documentService.uploadDocument(
                        10L, " ", "IDENTITY", validFile()
                )
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());

        verifyNoInteractions(employeeRepository, documentStorageService);
    }

    @Test
    void uploadDocumentShouldRejectNameLongerThan150Characters() {

        String longName = "A".repeat(151);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> documentService.uploadDocument(
                        10L, longName, "IDENTITY", validFile()
                )
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());

        verifyNoInteractions(employeeRepository, documentStorageService);
    }

    @Test
    void uploadDocumentShouldRejectBlankType() {

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> documentService.uploadDocument(
                        10L, "Identity", " ", validFile()
                )
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());

        verifyNoInteractions(employeeRepository, documentStorageService);
    }

    @Test
    void uploadDocumentShouldReturnNotFoundForEmployeeOutsideOrganization() {

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(5L);

        when(employeeRepository.findByIdAndUser_Organization_Id(99L, 5L))
                .thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> documentService.uploadDocument(
                        99L, "Identity", "IDENTITY", validFile()
                )
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());

        verify(documentStorageService, never()).store(any());
        verify(documentRepository, never()).saveAndFlush(any());
    }

    @Test
    void uploadDocumentShouldNotSaveWhenStorageFails() {

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(5L);

        when(employeeRepository.findByIdAndUser_Organization_Id(10L, 5L))
                .thenReturn(Optional.of(employee));

        RuntimeException storageException =
                new RuntimeException("Storage failed");

        when(documentStorageService.store(any()))
                .thenThrow(storageException);

        RuntimeException actualException = assertThrows(
                RuntimeException.class,
                () -> documentService.uploadDocument(
                        10L, "Identity", "IDENTITY", validFile()
                )
        );

        assertSame(storageException, actualException);

        verify(documentRepository, never()).saveAndFlush(any());
        verify(documentStorageService, never()).delete(anyString());
    }

    @Test
    void uploadDocumentShouldDeleteStoredFileWhenDatabaseSaveFails() {

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(5L);

        when(employeeRepository.findByIdAndUser_Organization_Id(10L, 5L))
                .thenReturn(Optional.of(employee));

        when(documentStorageService.store(any()))
                .thenReturn(storedDocument());

        RuntimeException databaseException =
                new RuntimeException("Database save failed");

        when(documentRepository.saveAndFlush(any(Document.class)))
                .thenThrow(databaseException);

        RuntimeException actualException = assertThrows(
                RuntimeException.class,
                () -> documentService.uploadDocument(
                        10L, "Identity", "IDENTITY", validFile()
                )
        );

        assertSame(databaseException, actualException);

        verify(documentStorageService).delete(
                storedDocument().storageKey()
        );
    }

    @Test
    void uploadDocumentShouldPreserveDatabaseExceptionWhenCleanupFails() {

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(5L);

        when(employeeRepository.findByIdAndUser_Organization_Id(10L, 5L))
                .thenReturn(Optional.of(employee));

        when(documentStorageService.store(any()))
                .thenReturn(storedDocument());

        RuntimeException databaseException =
                new RuntimeException("Database save failed");

        RuntimeException cleanupException =
                new RuntimeException("File cleanup failed");

        when(documentRepository.saveAndFlush(any(Document.class)))
                .thenThrow(databaseException);

        doThrow(cleanupException)
                .when(documentStorageService)
                .delete(storedDocument().storageKey());

        RuntimeException actualException = assertThrows(
                RuntimeException.class,
                () -> documentService.uploadDocument(
                        10L, "Identity", "IDENTITY", validFile()
                )
        );

        assertSame(databaseException, actualException);
        assertEquals(1, actualException.getSuppressed().length);
        assertSame(cleanupException, actualException.getSuppressed()[0]);
    }

    // --------------------------------------------------
    // DOCUMENT DOWNLOAD TESTS
    // --------------------------------------------------

    @Test
    void downloadDocumentShouldReturnFileForCurrentOrganization() {

        Document document = mock(Document.class);

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(5L);

        when(documentRepository
                .findByIdAndEmployee_User_Organization_Id(20L, 5L))
                .thenReturn(Optional.of(document));

        when(document.getStorageKey())
                .thenReturn(storedDocument().storageKey());

        when(document.getOriginalFileName())
                .thenReturn("identity.pdf");

        when(document.getContentType())
                .thenReturn("application/pdf");

        byte[] fileContent = {1, 2, 3};

        when(documentStorageService.load(storedDocument().storageKey()))
                .thenReturn(fileContent);

        DocumentService.DownloadedDocument result =
                documentService.downloadDocument(20L);

        assertArrayEquals(fileContent, result.content());
        assertEquals("identity.pdf", result.fileName());
        assertEquals("application/pdf", result.contentType());

        verify(documentRepository)
                .findByIdAndEmployee_User_Organization_Id(20L, 5L);

        verify(documentStorageService)
                .load(storedDocument().storageKey());
    }

    @Test
    void downloadDocumentShouldRejectInvalidId() {

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> documentService.downloadDocument(0L)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());

        verifyNoInteractions(
                currentTenantService,
                documentRepository,
                documentStorageService
        );
    }

    @Test
    void downloadDocumentShouldRejectDocumentOutsideCurrentOrganization() {

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(5L);

        when(documentRepository
                .findByIdAndEmployee_User_Organization_Id(20L, 5L))
                .thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> documentService.downloadDocument(20L)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());

        verify(documentStorageService, never()).load(anyString());
    }

    @Test
    void downloadDocumentShouldReturnNotFoundWhenPhysicalFileIsMissing() {

        Document document = mock(Document.class);

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(5L);

        when(documentRepository
                .findByIdAndEmployee_User_Organization_Id(20L, 5L))
                .thenReturn(Optional.of(document));

        when(document.getStorageKey())
                .thenReturn(storedDocument().storageKey());

        when(documentStorageService.load(storedDocument().storageKey()))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> documentService.downloadDocument(20L)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());

        verify(documentStorageService)
                .load(storedDocument().storageKey());
    }
}
