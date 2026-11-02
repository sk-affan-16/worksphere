
package com.worksphere.documents;

import com.worksphere.employee.Employee;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "documents")
public class Document {

    public enum Status {
        PENDING,
        APPROVED,
        REJECTED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 100)
    private String type;

    @Column(name = "original_file_name", nullable = false, length = 255)
    private String originalFileName;

    @Column(name = "storage_key", nullable = false, unique = true, length = 100)
    private String storageKey;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.PENDING;

    @Column(nullable = false, updatable = false)
    private Instant uploadedAt = Instant.now();

    private Instant reviewedAt;

    protected Document() {
        // Required by JPA
    }

    public Document(
            Employee employee,
            String name,
            String type,
            String originalFileName,
            String storageKey,
            String contentType,
            Long fileSize
    ) {
        if (employee == null) {
            throw new IllegalArgumentException("Employee is required");
        }
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Document name is required");
        }
        if (type == null || type.isBlank()) {
            throw new IllegalArgumentException("Document type is required");
        }
        if (originalFileName == null || originalFileName.isBlank()) {
            throw new IllegalArgumentException("Original file name is required");
        }
        if (storageKey == null || storageKey.isBlank()) {
            throw new IllegalArgumentException("Storage key is required");
        }
        if (contentType == null || contentType.isBlank()) {
            throw new IllegalArgumentException("Content type is required");
        }
        if (fileSize == null || fileSize <= 0) {
            throw new IllegalArgumentException("File size must be positive");
        }

        this.employee = employee;
        this.name = name.trim();
        this.type = type.trim();
        this.originalFileName = originalFileName;
        this.storageKey = storageKey;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.status = Status.PENDING;
    }

    public Long getId() {
        return id;
    }

    public Employee getEmployee() {
        return employee;
    }

    public String getName() {
        return name;
    }

    public String getType() {
        return type;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public String getStorageKey() {
        return storageKey;
    }

    public String getContentType() {
        return contentType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public Status getStatus() {
        return status;
    }

    public Instant getUploadedAt() {
        return uploadedAt;
    }

    public Instant getReviewedAt() {
        return reviewedAt;
    }

    public void review(Status status) {
        if (status != Status.APPROVED && status != Status.REJECTED) {
            throw new IllegalArgumentException(
                    "Review status must be APPROVED or REJECTED"
            );
        }

        this.status = status;
        this.reviewedAt = Instant.now();
    }
}
