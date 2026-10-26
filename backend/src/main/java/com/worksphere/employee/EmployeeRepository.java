
package com.worksphere.employee;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    @EntityGraph(attributePaths = "user")
    List<Employee> findAllByUser_Organization_Id(Long organizationId);

    @EntityGraph(attributePaths = "user")
    Optional<Employee> findByIdAndUser_Organization_Id(
            Long employeeId,
            Long organizationId
    );

    boolean existsByUser_Id(Long userId);
}
