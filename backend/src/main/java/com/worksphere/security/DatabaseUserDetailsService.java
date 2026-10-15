package com.worksphere.security;

import com.worksphere.user.User;
import com.worksphere.user.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class DatabaseUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public DatabaseUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        String normalizedEmail = email == null
                ? ""
                : email.trim().toLowerCase(Locale.ROOT);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Invalid email or password"));

        boolean accountEnabled =
                user.getStatus() == User.Status.ACTIVE
                        && user.getOrganization() != null
                        && user.getOrganization().getStatus()
                        == com.worksphere.organization.Organization.Status.ACTIVE;

        if (user.getOrganization() == null
                || user.getOrganization().getId() == null) {
            throw new UsernameNotFoundException(
                    "User organization is unavailable");
        }

        return new WorksphereUserPrincipal(
                user.getId(),
                user.getOrganization().getId(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getRole().name(),
                accountEnabled
        );
    }
}