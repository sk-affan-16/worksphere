
package com.worksphere.user;

import com.worksphere.security.CurrentTenantService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final CurrentTenantService currentTenantService;

    public UserService(
            UserRepository userRepository,
            CurrentTenantService currentTenantService
    ) {
        this.userRepository = userRepository;
        this.currentTenantService = currentTenantService;
    }

    /**
     * Returns only users belonging to the authenticated organization.
     */
    public List<User> getAllUsers() {
        Long organizationId =
                currentTenantService.getCurrentOrganizationId();

        return userRepository.findAllByOrganization_Id(organizationId);
    }

    /**
     * Finds a user only within the authenticated organization.
     *
     * A user belonging to another organization is treated as not found.
     */
    public User getUserById(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException(
                    "User ID must be a positive number"
            );
        }

        Long organizationId =
                currentTenantService.getCurrentOrganizationId();

        return userRepository
                .findByIdAndOrganization_Id(userId, organizationId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "User not found"
                ));
    }
}
