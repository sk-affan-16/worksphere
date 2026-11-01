
package com.worksphere.documents;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    @EntityGraph(attributePaths = {"employee", "employee.user"})
    List<Document> findAllByEmployee_User_Organization_Id(Long organizationId);

    @EntityGraph(attributePaths = {"employee", "employee.user"})
    Optional<Document> findByIdAndEmployee_User_Organization_Id(
            Long documentId,
            Long organizationId
    );
}
