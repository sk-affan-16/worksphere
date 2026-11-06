
package com.worksphere.documents;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    // Find all documents belonging to the current organization (ORG_ADMIN)
    @EntityGraph(attributePaths = {"employee", "employee.user"})
    List<Document> findAllByEmployee_User_Organization_Id(Long organizationId);

    // Find one document within the current organization (ORG_ADMIN)
    @EntityGraph(attributePaths = {"employee", "employee.user"})
    Optional<Document> findByIdAndEmployee_User_Organization_Id(
            Long documentId,
            Long organizationId
    );

    // Find all documents belonging to the authenticated employee (EMPLOYEE)
    @EntityGraph(attributePaths = {"employee", "employee.user"})
    List<Document> findAllByEmployee_User_Id(Long userId);

    // Find one document belonging to the authenticated employee (EMPLOYEE)
    @EntityGraph(attributePaths = {"employee", "employee.user"})
    Optional<Document> findByIdAndEmployee_User_Id(
            Long documentId,
            Long userId
    );
}
