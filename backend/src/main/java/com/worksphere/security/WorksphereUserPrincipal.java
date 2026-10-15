package com.worksphere.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Objects;

public final class WorksphereUserPrincipal implements UserDetails {

    private final Long userId;
    private final Long organizationId;
    private final String email;
    private final String passwordHash;
    private final String role;
    private final boolean enabled;

    public WorksphereUserPrincipal(
            Long userId,
            Long organizationId,
            String email,
            String passwordHash,
            String role,
            boolean enabled
    ) {
        this.userId = Objects.requireNonNull(userId, "userId is required");
        this.organizationId = Objects.requireNonNull(
                organizationId, "organizationId is required");
        this.email = Objects.requireNonNull(email, "email is required");
        this.passwordHash = Objects.requireNonNull(
                passwordHash, "passwordHash is required");
        this.role = Objects.requireNonNull(role, "role is required");
        this.enabled = enabled;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public String getRole() {
        return role;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
}