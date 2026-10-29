
package com.worksphere.onboarding;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OnboardingRepository
        extends JpaRepository<Onboarding, Long> {

    @EntityGraph(attributePaths = {"employee", "employee.user"})
    List<Onboarding> findAllByEmployee_User_Organization_Id(
            Long organizationId
    );

    @EntityGraph(attributePaths = {"employee", "employee.user"})
    Optional<Onboarding> findByIdAndEmployee_User_Organization_Id(
            Long onboardingId,
            Long organizationId
    );

    boolean existsByEmployee_Id(Long employeeId);
}
