
package com.worksphere.employee;

import com.worksphere.user.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    @EntityGraph(attributePaths = "user")
    List<Employee> findAllByUser_Organization_Id(Long organizationId);

    @EntityGraph(attributePaths = "user")
    List<Employee> findAllByUser_Organization_IdAndUser_Role(
            Long organizationId,
            User.Role role
    );

    @EntityGraph(attributePaths = "user")
    Optional<Employee> findByIdAndUser_Organization_Id(
            Long employeeId,
            Long organizationId
    );

    @EntityGraph(attributePaths = "user")
    Optional<Employee> findByIdAndUser_Organization_IdAndUser_Role(
            Long employeeId,
            Long organizationId,
            User.Role role
    );

    boolean existsByUser_Id(Long userId);

    Optional<Employee> findByUser_Id(Long userId);
}
