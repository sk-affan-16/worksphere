
package com.worksphere.user;

import java.time.Instant;

/**
 * Public representation of a user.
 *
 * Deliberately excludes password hashes and organization entities.
 */
public record UserResponse(
        Long id,
        String email,
        User.Role role,
        User.Status status,
        Instant createdAt
) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt()
        );
    }
}
