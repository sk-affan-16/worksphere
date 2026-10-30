
package com.worksphere.auth;

import com.worksphere.auth.dto.OrganizationSignupRequest;
import com.worksphere.auth.dto.OrganizationSignupResponse;
import com.worksphere.organization.Organization;
import com.worksphere.organization.OrganizationRepository;
import com.worksphere.user.User;
import com.worksphere.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrganizationSignupServiceTest {

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private OrganizationSignupService signupService;

    @Test
    void successfullyRegistersOrganizationAndAdmin() {

        OrganizationSignupRequest request =
                new OrganizationSignupRequest(
                        "  WorkSphere Technologies  ",
                        " ADMIN@EXAMPLE.COM ",
                        "StrongPassword123"
                );

        when(userRepository.findByEmail("admin@example.com"))
                .thenReturn(Optional.empty());

        when(passwordEncoder.encode("StrongPassword123"))
                .thenReturn("encoded-password");

        when(organizationRepository.save(any(Organization.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        OrganizationSignupResponse response =
                signupService.signup(request);

        ArgumentCaptor<Organization> organizationCaptor =
                ArgumentCaptor.forClass(Organization.class);

        ArgumentCaptor<User> userCaptor =
                ArgumentCaptor.forClass(User.class);

        verify(organizationRepository).save(organizationCaptor.capture());
        verify(userRepository).save(userCaptor.capture());

        Organization savedOrganization = organizationCaptor.getValue();
        User savedAdmin = userCaptor.getValue();

        assertNotNull(response);

        assertEquals(
                "WorkSphere Technologies",
                savedOrganization.getName()
        );

        assertEquals(
                "admin@example.com",
                savedAdmin.getEmail()
        );

        assertEquals(
                User.Role.ORG_ADMIN,
                savedAdmin.getRole()
        );

        assertEquals(
                User.Status.ACTIVE,
                savedAdmin.getStatus()
        );

        assertEquals(
                "encoded-password",
                savedAdmin.getPasswordHash()
        );

        assertSame(
                savedOrganization,
                savedAdmin.getOrganization()
        );

        verify(passwordEncoder).encode("StrongPassword123");
    }

    @Test
    void rejectsDuplicateEmail() {

        OrganizationSignupRequest request =
                new OrganizationSignupRequest(
                        "WorkSphere",
                        "admin@example.com",
                        "StrongPassword123"
                );

        User existingUser = mock(User.class);

        when(userRepository.findByEmail("admin@example.com"))
                .thenReturn(Optional.of(existingUser));

        ResponseStatusException exception =
                assertThrows(
                        ResponseStatusException.class,
                        () -> signupService.signup(request)
                );

        assertEquals(
                HttpStatus.CONFLICT,
                exception.getStatusCode()
        );

        verify(userRepository, never()).save(any(User.class));
        verifyNoInteractions(organizationRepository);
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    void trimsOrganizationNameAndNormalizesEmail() {

        OrganizationSignupRequest request =
                new OrganizationSignupRequest(
                        "  My Company  ",
                        "  ADMIN@EXAMPLE.COM  ",
                        "StrongPassword123"
                );

        when(userRepository.findByEmail("admin@example.com"))
                .thenReturn(Optional.empty());

        when(passwordEncoder.encode(any()))
                .thenReturn("encoded-password");

        when(organizationRepository.save(any(Organization.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        signupService.signup(request);

        ArgumentCaptor<Organization> organizationCaptor =
                ArgumentCaptor.forClass(Organization.class);

        ArgumentCaptor<User> userCaptor =
                ArgumentCaptor.forClass(User.class);

        verify(organizationRepository).save(organizationCaptor.capture());
        verify(userRepository).save(userCaptor.capture());

        assertEquals(
                "My Company",
                organizationCaptor.getValue().getName()
        );

        assertEquals(
                "admin@example.com",
                userCaptor.getValue().getEmail()
        );
    }
}
