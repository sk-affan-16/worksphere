package com.worksphere.employee;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    List<Employee> findAllByUser_Organization_Id(Long organizationId);

    Optional<Employee> findByIdAndUser_Organization_Id(
            Long employeeId,
            Long organizationId
    );

    boolean existsByUser_Id(Long userId);
}
