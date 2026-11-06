
package com.worksphere.documents;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    public record UpdateDocumentStatusRequest(
            @NotNull Document.Status status
    ) {
    }

    // UPLOAD DOCUMENT
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public DocumentResponse uploadDocument(
            @RequestParam Long employeeId,
            @RequestParam String name,
            @RequestParam String type,
            @RequestParam("file") MultipartFile file
    ) {
        return documentService.uploadDocument(
                employeeId,
                name,
                type,
                file
        );
    }

    // GET ALL DOCUMENTS
    @GetMapping
    public List<DocumentResponse> getAllDocuments() {
        return documentService.getAllDocuments();
    }

    // GET DOCUMENT DETAILS
    @GetMapping("/{id}")
    public DocumentResponse getDocumentById(
            @PathVariable Long id
    ) {
        return documentService.getDocumentById(id);
    }

    // APPROVE OR REJECT DOCUMENT
    @PatchMapping("/{id}/status")
    public DocumentResponse updateDocumentStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDocumentStatusRequest request
    ) {
        return documentService.updateDocumentStatus(
                id,
                request.status()
        );
    }

    // DOWNLOAD DOCUMENT
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadDocument(
            @PathVariable Long id
    ) {
        DocumentService.DownloadedDocument document =
                documentService.downloadDocument(id);

        return ResponseEntity.ok()
                .contentType(
                        MediaType.parseMediaType(
                                document.contentType()
                        )
                )
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\""
                                + document.fileName()
                                .replace("\"", "")
                                + "\""
                )
                .body(document.content());
    }
}
