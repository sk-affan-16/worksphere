
package com.worksphere.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentTenantService {

    public Long getCurrentOrganizationId() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal()
                instanceof WorksphereUserPrincipal principal)) {
            throw new AccessDeniedException(
                    "Authenticated organization context is required"
            );
        }

        return principal.getOrganizationId();
    }

    public Long getCurrentUserId() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal()
                instanceof WorksphereUserPrincipal principal)) {
            throw new AccessDeniedException(
                    "Authenticated user context is required"
            );
        }

        return principal.getUserId();
    }
}
