
package com.worksphere.user;

import com.worksphere.security.CurrentTenantService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CurrentTenantService currentTenantService;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(
                userRepository,
                currentTenantService
        );
    }

    @Test
    void getAllUsersUsesAuthenticatedOrganization() {
        Long organizationId = 10L;
        List<User> expectedUsers = List.of();

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(organizationId);

        when(userRepository.findAllByOrganization_Id(organizationId))
                .thenReturn(expectedUsers);

        List<User> actualUsers = userService.getAllUsers();

        assertSame(expectedUsers, actualUsers);
        verify(userRepository).findAllByOrganization_Id(organizationId);
    }

    @Test
    void getUserByIdUsesAuthenticatedOrganization() {
        Long organizationId = 10L;
        Long userId = 25L;

        User expectedUser = org.mockito.Mockito.mock(User.class);

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(organizationId);

        when(userRepository.findByIdAndOrganization_Id(
                userId, organizationId))
                .thenReturn(Optional.of(expectedUser));

        User actualUser = userService.getUserById(userId);

        assertSame(expectedUser, actualUser);
        verify(userRepository).findByIdAndOrganization_Id(
                userId, organizationId);
    }

    @Test
    void getUserByIdThrowsWhenUserIsNotInAuthenticatedOrganization() {
        Long organizationId = 10L;
        Long userId = 99L;

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(organizationId);

        when(userRepository.findByIdAndOrganization_Id(
                userId, organizationId))
                .thenReturn(Optional.empty());

        assertThrows(
                EntityNotFoundException.class,
                () -> userService.getUserById(userId)
        );

        verify(userRepository).findByIdAndOrganization_Id(
                userId, organizationId);
    }

    @Test
    void getUserByIdRejectsNullId() {
        assertThrows(
                IllegalArgumentException.class,
                () -> userService.getUserById(null)
        );

        verifyNoInteractions(userRepository, currentTenantService);
    }

    @Test
    void getUserByIdRejectsNonPositiveId() {
        assertThrows(
                IllegalArgumentException.class,
                () -> userService.getUserById(0L)
        );

        assertThrows(
                IllegalArgumentException.class,
                () -> userService.getUserById(-1L)
        );

        verifyNoInteractions(userRepository, currentTenantService);
    }
}
