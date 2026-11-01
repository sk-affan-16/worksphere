
package com.worksphere.onboarding;

import com.worksphere.employee.Employee;
import com.worksphere.employee.EmployeeRepository;
import com.worksphere.security.CurrentTenantService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OnboardingServiceTest {

    @Mock
    private OnboardingRepository onboardingRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private CurrentTenantService currentTenantService;

    @InjectMocks
    private OnboardingService onboardingService;

    private Employee employee;

    @BeforeEach
    void setUp() {
        employee = mock(Employee.class);
    }

    @Test
    void createOnboardingShouldSaveRecordForCurrentOrganization() {

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(1L);
        when(employeeRepository.findByIdAndUser_Organization_Id(10L, 1L))
                .thenReturn(Optional.of(employee));
        when(onboardingRepository.existsByEmployee_Id(10L))
                .thenReturn(false);
        when(onboardingRepository.save(any(Onboarding.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Onboarding result = onboardingService.createOnboarding(10L);

        assertNotNull(result);
        assertSame(employee, result.getEmployee());
        assertEquals(Onboarding.Status.NOT_STARTED, result.getStatus());

        verify(employeeRepository)
                .findByIdAndUser_Organization_Id(10L, 1L);
        verify(onboardingRepository).save(any(Onboarding.class));
    }

    @Test
    void createOnboardingShouldRejectInvalidEmployeeId() {

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> onboardingService.createOnboarding(0L)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        verifyNoInteractions(employeeRepository, onboardingRepository);
    }

    @Test
    void createOnboardingShouldReturnNotFoundForEmployeeOutsideOrganization() {

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(1L);
        when(employeeRepository.findByIdAndUser_Organization_Id(20L, 1L))
                .thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> onboardingService.createOnboarding(20L)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(onboardingRepository, never()).save(any(Onboarding.class));
    }

    @Test
    void createOnboardingShouldRejectDuplicateRecord() {

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(1L);
        when(employeeRepository.findByIdAndUser_Organization_Id(10L, 1L))
                .thenReturn(Optional.of(employee));
        when(onboardingRepository.existsByEmployee_Id(10L))
                .thenReturn(true);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> onboardingService.createOnboarding(10L)
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(onboardingRepository, never()).save(any(Onboarding.class));
    }

    @Test
    void getOnboardingsShouldQueryOnlyCurrentOrganization() {

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(7L);
        when(onboardingRepository
                .findAllByEmployee_User_Organization_Id(7L))
                .thenReturn(List.of());

        List<Onboarding> result = onboardingService.getOnboardings();

        assertTrue(result.isEmpty());
        verify(onboardingRepository)
                .findAllByEmployee_User_Organization_Id(7L);
    }

    @Test
    void getOnboardingShouldReturnNotFoundOutsideCurrentOrganization() {

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(1L);
        when(onboardingRepository
                .findByIdAndEmployee_User_Organization_Id(99L, 1L))
                .thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> onboardingService.getOnboarding(99L)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void updateStatusShouldMarkOnboardingCompleted() {

        Onboarding onboarding = new Onboarding(employee);

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(1L);
        when(onboardingRepository
                .findByIdAndEmployee_User_Organization_Id(5L, 1L))
                .thenReturn(Optional.of(onboarding));
        when(onboardingRepository.save(any(Onboarding.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Onboarding result = onboardingService.updateStatus(
                5L,
                Onboarding.Status.COMPLETED
        );

        assertEquals(Onboarding.Status.COMPLETED, result.getStatus());
        assertNotNull(result.getCompletedAt());
        verify(onboardingRepository).save(onboarding);
    }

    @Test
    void updateStatusShouldRejectNullStatus() {

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> onboardingService.updateStatus(5L, null)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        verify(onboardingRepository, never()).save(any(Onboarding.class));
    }

    // Additional test 1: Reject invalid onboarding ID.

    @Test
    void getOnboardingShouldRejectInvalidId() {

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> onboardingService.getOnboarding(0L)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());

        verifyNoInteractions(onboardingRepository);
    }

    // Additional test 2: Prevent updating another tenant's onboarding.

    @Test
    void updateStatusShouldReturnNotFoundForOtherTenant() {

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(1L);

        when(onboardingRepository
                .findByIdAndEmployee_User_Organization_Id(99L, 1L))
                .thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> onboardingService.updateStatus(
                        99L,
                        Onboarding.Status.COMPLETED
                )
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());

        verify(onboardingRepository, never()).save(any(Onboarding.class));
    }
}
