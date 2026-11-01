
package com.worksphere.documents;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class DocumentStorageServiceTest {

    @TempDir
    Path tempDir;

    private DocumentStorageService storageService;

    @BeforeEach
    void setUp() {
        storageService = new DocumentStorageService(
                tempDir.toString()
        );
    }

    @Test
    void shouldStorePdfFile() throws Exception {

        byte[] content = {
                0x25, 0x50, 0x44, 0x46, 0x2D,
                0x31, 0x2E, 0x37
        };

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "document.pdf",
                "application/pdf",
                content
        );

        DocumentStorageService.StoredDocument result =
                storageService.store(file);

        assertEquals("document.pdf", result.originalFileName());
        assertEquals("application/pdf", result.contentType());
        assertEquals(content.length, result.fileSize());
        assertTrue(result.storageKey().endsWith(".pdf"));
        assertTrue(Files.exists(tempDir.resolve(result.storageKey())));
    }

    @Test
    void shouldStorePngFile() throws Exception {

        byte[] content = {
                (byte) 0x89, 0x50, 0x4E, 0x47,
                0x0D, 0x0A, 0x1A, 0x0A
        };

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "image.png",
                "image/png",
                content
        );

        DocumentStorageService.StoredDocument result =
                storageService.store(file);

        assertEquals("image/png", result.contentType());
        assertTrue(result.storageKey().endsWith(".png"));
        assertTrue(Files.exists(tempDir.resolve(result.storageKey())));
    }

    @Test
    void shouldStoreJpegFile() throws Exception {

        byte[] content = {
                (byte) 0xFF, (byte) 0xD8, (byte) 0xFF,
                0x01, 0x02, 0x03
        };

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "photo.jpg",
                "image/jpeg",
                content
        );

        DocumentStorageService.StoredDocument result =
                storageService.store(file);

        assertEquals("image/jpeg", result.contentType());
        assertTrue(result.storageKey().endsWith(".jpg"));
        assertTrue(Files.exists(tempDir.resolve(result.storageKey())));
    }

    @Test
    void shouldRejectNullFile() {

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> storageService.store(null)
        );

        assertEquals(
                HttpStatus.BAD_REQUEST,
                exception.getStatusCode()
        );
    }

    @Test
    void shouldRejectEmptyFile() {

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "empty.pdf",
                "application/pdf",
                new byte[0]
        );

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> storageService.store(file)
        );

        assertEquals(
                HttpStatus.BAD_REQUEST,
                exception.getStatusCode()
        );
    }

    @Test
    void shouldRejectFileLargerThanTenMb() {

        byte[] content = new byte[10 * 1024 * 1024 + 1];

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "large.pdf",
                "application/pdf",
                content
        );

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> storageService.store(file)
        );

        assertEquals(
                HttpStatus.BAD_REQUEST,
                exception.getStatusCode()
        );
    }

    @Test
    void shouldRejectUnsupportedFileType() {

        byte[] content = "This is not a supported document".getBytes();

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "document.txt",
                "text/plain",
                content
        );

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> storageService.store(file)
        );

        assertEquals(
                HttpStatus.BAD_REQUEST,
                exception.getStatusCode()
        );
    }

    @Test
    void shouldSanitizeOriginalFileName() throws Exception {

        byte[] content = {
                0x25, 0x50, 0x44, 0x46, 0x2D
        };

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "../../secret.pdf",
                "application/pdf",
                content
        );

        DocumentStorageService.StoredDocument result =
                storageService.store(file);

        assertEquals("secret.pdf", result.originalFileName());
    }

    @Test
    void shouldDeleteStoredFile() throws Exception {

        byte[] content = {
                0x25, 0x50, 0x44, 0x46, 0x2D
        };

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "document.pdf",
                "application/pdf",
                content
        );

        DocumentStorageService.StoredDocument result =
                storageService.store(file);

        Path storedFile = tempDir.resolve(result.storageKey());

        assertTrue(Files.exists(storedFile));

        storageService.delete(result.storageKey());

        assertFalse(Files.exists(storedFile));
    }

    @Test
    void shouldRejectInvalidStorageKey() {

        assertThrows(
                IllegalArgumentException.class,
                () -> storageService.delete("../document.pdf")
        );
    }

    // NEW DOWNLOAD STORAGE TESTS

    @Test
    void shouldLoadStoredFile() throws Exception {

        byte[] content = {
                0x25, 0x50, 0x44, 0x46, 0x2D,
                0x31, 0x2E, 0x37
        };

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "document.pdf",
                "application/pdf",
                content
        );

        DocumentStorageService.StoredDocument stored =
                storageService.store(file);

        byte[] loadedContent =
                storageService.load(stored.storageKey());

        assertArrayEquals(content, loadedContent);
    }

    @Test
    void shouldRejectInvalidStorageKeyWhenLoading() {

        assertThrows(
                IllegalArgumentException.class,
                () -> storageService.load("../document.pdf")
        );
    }

    @Test
    void shouldReturnNotFoundWhenStoredFileDoesNotExist() {

        String missingStorageKey =
                "123e4567-e89b-12d3-a456-426614174000.pdf";

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> storageService.load(missingStorageKey)
        );

        assertEquals(
                HttpStatus.NOT_FOUND,
                exception.getStatusCode()
        );
    }
}
