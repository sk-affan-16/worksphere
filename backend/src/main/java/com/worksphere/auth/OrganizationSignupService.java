package com.worksphere.auth;

import com.worksphere.auth.dto.OrganizationSignupRequest;
import com.worksphere.auth.dto.OrganizationSignupResponse;
import com.worksphere.organization.Organization;
import com.worksphere.organization.OrganizationRepository;
import com.worksphere.user.User;
import com.worksphere.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@Service
public class OrganizationSignupService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public OrganizationSignupService(
            OrganizationRepository organizationRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public OrganizationSignupResponse signup(
            OrganizationSignupRequest request
    ) {
        String organizationName = request.organizationName().trim();
        String email = request.email().trim().toLowerCase(Locale.ROOT);

        if (organizationName.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Organization name is required"
            );
        }

        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email is already registered"
            );
        }

        Organization organization =
                organizationRepository.save(
                        new Organization(organizationName)
                );

        User admin = new User(
                organization,
                email,
                passwordEncoder.encode(request.password()),
                User.Role.ORG_ADMIN
        );

        admin.setStatus(User.Status.ACTIVE);
        User savedAdmin = userRepository.save(admin);

        return new OrganizationSignupResponse(
                organization.getId(),
                organization.getName(),
                savedAdmin.getId(),
                savedAdmin.getEmail(),
                "Organization registered successfully"
        );
    }
}