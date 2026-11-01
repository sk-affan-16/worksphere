
package com.worksphere.documents;

import com.worksphere.employee.Employee;

public final class DocumentMapper {

    private DocumentMapper() {
        // Utility class
    }

    public static DocumentResponse toResponse(Document document) {
        Employee employee = document.getEmployee();

        String employeeName = employee.getFirstName()
                + " "
                + employee.getLastName();

        return new DocumentResponse(
                document.getId(),
                employee.getId(),
                employeeName,
                document.getName(),
                document.getType(),
                document.getOriginalFileName(),
                document.getContentType(),
                document.getFileSize(),
                document.getStatus(),
                document.getUploadedAt(),
                document.getReviewedAt()
        );
    }
}
