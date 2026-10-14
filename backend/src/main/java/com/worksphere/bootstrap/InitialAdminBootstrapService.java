package com.worksphere.bootstrap;

import com.worksphere.organization.Organization;
import com.worksphere.organization.OrganizationRepository;
import com.worksphere.user.User;
import com.worksphere.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

@Service
public class InitialAdminBootstrapService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public InitialAdminBootstrapService(
            OrganizationRepository organizationRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void initialize(String organizationName, String adminEmail, String adminPassword) {
        String normalizedOrganizationName =
                organizationName == null ? "" : organizationName.trim();
        String normalizedEmail =
                adminEmail == null ? "" : adminEmail.trim().toLowerCase(Locale.ROOT);

        if (normalizedOrganizationName.isBlank() || normalizedOrganizationName.length() > 150) {
            throw new IllegalArgumentException(
                    "Bootstrap organization name must contain 1 to 150 characters");
        }

        if (normalizedEmail.isBlank()
                || normalizedEmail.length() > 254
                || !normalizedEmail.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new IllegalArgumentException("Bootstrap administrator email is invalid");
        }

        if (adminPassword == null
                || adminPassword.getBytes(StandardCharsets.UTF_8).length < 12
                || adminPassword.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new IllegalArgumentException(
                    "Bootstrap administrator password must be 12 to 72 UTF-8 bytes");
        }

        long organizationCount = organizationRepository.count();
        long userCount = userRepository.count();

        if (organizationCount != 0 || userCount != 0) {
            throw new IllegalStateException(
                    "Bootstrap refused: organizations or users already exist");
        }

        Organization organization =
                organizationRepository.save(new Organization(normalizedOrganizationName));

        User admin = new User(
                organization,
                normalizedEmail,
                passwordEncoder.encode(adminPassword),
                User.Role.ORG_ADMIN
        );

        admin.setStatus(User.Status.ACTIVE);
        userRepository.save(admin);
    }
}
