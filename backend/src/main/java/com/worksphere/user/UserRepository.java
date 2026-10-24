
package com.worksphere.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    List<User> findAllByOrganization_Id(Long organizationId);

    Optional<User> findByIdAndOrganization_Id(
            Long userId,
            Long organizationId
    );
}
