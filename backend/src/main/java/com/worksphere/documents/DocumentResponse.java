
package com.worksphere.documents;

import java.time.Instant;

public record DocumentResponse(
        Long id,
        Long employeeId,
        String employeeName,
        String name,
        String type,
        String originalFileName,
        String contentType,
        Long fileSize,
        Document.Status status,
        Instant uploadedAt,
        Instant reviewedAt
) {
}
