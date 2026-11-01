
package com.worksphere.documents;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.UUID;

@Service
public class DocumentStorageService {

    private static final long MAX_FILE_SIZE = 10L * 1024 * 1024;

    private static final byte[] PDF_SIGNATURE = {
            0x25, 0x50, 0x44, 0x46, 0x2D
    };

    private static final byte[] PNG_SIGNATURE = {
            (byte) 0x89, 0x50, 0x4E, 0x47,
            0x0D, 0x0A, 0x1A, 0x0A
    };

    private final Path storageDirectory;

    public DocumentStorageService(
            @Value("${app.documents.storage-dir:./var/worksphere/documents}")
            String storageDirectory
    ) {
        this.storageDirectory = Path.of(storageDirectory)
                .toAbsolutePath()
                .normalize();
    }

    // STORE DOCUMENT
    public StoredDocument store(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please select a file"
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "File size must not exceed 10 MB"
            );
        }

        String originalFileName = sanitizeFileName(
                file.getOriginalFilename()
        );

        try {
            byte[] content = file.getBytes();

            String extension;
            String contentType;

            if (hasSignature(content, PDF_SIGNATURE)) {
                extension = ".pdf";
                contentType = "application/pdf";

            } else if (hasSignature(content, PNG_SIGNATURE)) {
                extension = ".png";
                contentType = "image/png";

            } else if (isJpeg(content)) {
                extension = ".jpg";
                contentType = "image/jpeg";

            } else {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Only PDF, PNG and JPEG files are allowed"
                );
            }

            Files.createDirectories(storageDirectory);

            String storageKey = UUID.randomUUID() + extension;

            Path destination = storageDirectory
                    .resolve(storageKey)
                    .normalize();

            if (!destination.getParent().equals(storageDirectory)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid storage path"
                );
            }

            Files.write(
                    destination,
                    content,
                    StandardOpenOption.CREATE_NEW,
                    StandardOpenOption.WRITE
            );

            return new StoredDocument(
                    storageKey,
                    originalFileName,
                    contentType,
                    content.length
            );

        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to store document"
            );
        }
    }

    // DELETE DOCUMENT FILE
    public void delete(String storageKey) {

        validateStorageKey(storageKey);

        try {
            Path file = storageDirectory
                    .resolve(storageKey)
                    .normalize();

            validateStoragePath(file);

            Files.deleteIfExists(file);

        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Unable to delete stored document",
                    exception
            );
        }
    }

    // READ DOCUMENT FILE FOR DOWNLOAD
    public byte[] load(String storageKey) {

        validateStorageKey(storageKey);

        try {
            Path file = storageDirectory
                    .resolve(storageKey)
                    .normalize();

            validateStoragePath(file);

            if (!Files.isRegularFile(file)) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Document file not found"
                );
            }

            return Files.readAllBytes(file);

        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to read document"
            );
        }
    }

    // VALIDATE STORAGE KEY
    private void validateStorageKey(String storageKey) {

        if (storageKey == null
                || !storageKey.matches(
                "[0-9a-fA-F-]{36}\\.(pdf|png|jpg)"
        )) {
            throw new IllegalArgumentException(
                    "Invalid storage key"
            );
        }
    }

    // VALIDATE STORAGE PATH
    private void validateStoragePath(Path file) {

        if (!file.getParent().equals(storageDirectory)) {
            throw new IllegalArgumentException(
                    "Invalid storage path"
            );
        }
    }

    private boolean hasSignature(
            byte[] content,
            byte[] signature
    ) {
        if (content.length < signature.length) {
            return false;
        }

        for (int i = 0; i < signature.length; i++) {
            if (content[i] != signature[i]) {
                return false;
            }
        }

        return true;
    }

    private boolean isJpeg(byte[] content) {

        return content.length >= 3
                && (content[0] & 0xFF) == 0xFF
                && (content[1] & 0xFF) == 0xD8
                && (content[2] & 0xFF) == 0xFF;
    }

    private String sanitizeFileName(String fileName) {

        if (fileName == null || fileName.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Original file name is required"
            );
        }

        String safeName = fileName.replace('\\', '/');

        safeName = safeName.substring(
                safeName.lastIndexOf('/') + 1
        );

        safeName = safeName.replaceAll(
                "[\\p{Cntrl}]",
                "_"
        );

        if (safeName.isBlank() || safeName.length() > 255) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid file name"
            );
        }

        return safeName;
    }

    public record StoredDocument(
            String storageKey,
            String originalFileName,
            String contentType,
            long fileSize
    ) {
    }
}
