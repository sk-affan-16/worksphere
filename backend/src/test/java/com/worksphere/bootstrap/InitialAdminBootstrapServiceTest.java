package com.worksphere.bootstrap;

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
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InitialAdminBootstrapServiceTest {

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private InitialAdminBootstrapService bootstrapService;

    @Test
    void initializeCreatesOrganizationAndEncodedAdmin() {
        when(organizationRepository.count()).thenReturn(0L);
        when(userRepository.count()).thenReturn(0L);
        when(organizationRepository.save(any(Organization.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(passwordEncoder.encode("StrongPassword123"))
                .thenReturn("$2a$12$exampleEncodedPasswordHash");

        bootstrapService.initialize(
                "  WorkSphere Demo  ",
                " ADMIN@EXAMPLE.COM ",
                "StrongPassword123"
        );

        ArgumentCaptor<Organization> organizationCaptor =
                ArgumentCaptor.forClass(Organization.class);
        verify(organizationRepository).save(organizationCaptor.capture());
        assertEquals("WorkSphere Demo", organizationCaptor.getValue().getName());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User admin = userCaptor.getValue();
        assertEquals("admin@example.com", admin.getEmail());
        assertEquals(User.Role.ORG_ADMIN, admin.getRole());
        assertEquals(User.Status.ACTIVE, admin.getStatus());
        assertEquals("WorkSphere Demo", admin.getOrganization().getName());
        assertEquals("$2a$12$exampleEncodedPasswordHash", admin.getPasswordHash());
        assertNotEquals("StrongPassword123", admin.getPasswordHash());

        verify(passwordEncoder).encode("StrongPassword123");
    }

    @Test
    void initializeRefusesWhenOrganizationsAlreadyExist() {
        when(organizationRepository.count()).thenReturn(1L);
        when(userRepository.count()).thenReturn(0L);

        assertThrows(
                IllegalStateException.class,
                () -> bootstrapService.initialize(
                        "WorkSphere Demo",
                        "admin@example.com",
                        "StrongPassword123"
                )
        );

        verify(organizationRepository, never()).save(any(Organization.class));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void initializeRefusesWhenUsersAlreadyExist() {
        when(organizationRepository.count()).thenReturn(0L);
        when(userRepository.count()).thenReturn(1L);

        assertThrows(
                IllegalStateException.class,
                () -> bootstrapService.initialize(
                        "WorkSphere Demo",
                        "admin@example.com",
                        "StrongPassword123"
                )
        );

        verify(organizationRepository, never()).save(any(Organization.class));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void initializeRejectsInvalidEmailBeforeWriting() {
        assertThrows(
                IllegalArgumentException.class,
                () -> bootstrapService.initialize(
                        "WorkSphere Demo",
                        "not-an-email",
                        "StrongPassword123"
                )
        );

        verifyNoInteractions(organizationRepository, userRepository, passwordEncoder);
    }

    @Test
    void initializeRejectsShortPasswordBeforeWriting() {
        assertThrows(
                IllegalArgumentException.class,
                () -> bootstrapService.initialize(
                        "WorkSphere Demo",
                        "admin@example.com",
                        "short"
                )
        );

        verifyNoInteractions(organizationRepository, userRepository, passwordEncoder);
    }
}