package com.worksphere.employee;

import com.worksphere.organization.Organization;
import com.worksphere.organization.OrganizationRepository;
import com.worksphere.security.CurrentTenantService;
import com.worksphere.user.User;
import com.worksphere.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private CurrentTenantService currentTenantService;

    @Mock
    private PasswordEncoder passwordEncoder;

    private EmployeeService employeeService;

    @BeforeEach
    void setUp() {
        employeeService = new EmployeeService(
                employeeRepository,
                userRepository,
                organizationRepository,
                currentTenantService,
                passwordEncoder
        );
    }

    @Test
    void getEmployeesUsesAuthenticatedOrganization() {
        Long organizationId = 10L;
        List<Employee> expectedEmployees = List.of();

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(organizationId);

        when(employeeRepository.findAllByUser_Organization_Id(organizationId))
                .thenReturn(expectedEmployees);

        List<Employee> actualEmployees = employeeService.getEmployees();

        assertSame(expectedEmployees, actualEmployees);

        verify(employeeRepository)
                .findAllByUser_Organization_Id(organizationId);
    }

    @Test
    void getEmployeeUsesAuthenticatedOrganization() {
        Long organizationId = 10L;
        Long employeeId = 25L;

        Employee expectedEmployee =
                org.mockito.Mockito.mock(Employee.class);

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(organizationId);

        when(employeeRepository.findByIdAndUser_Organization_Id(
                employeeId, organizationId))
                .thenReturn(Optional.of(expectedEmployee));

        Employee actualEmployee =
                employeeService.getEmployee(employeeId);

        assertSame(expectedEmployee, actualEmployee);

        verify(employeeRepository)
                .findByIdAndUser_Organization_Id(
                        employeeId, organizationId);
    }

    @Test
    void getEmployeeThrowsNotFoundForEmployeeOutsideOrganization() {
        Long organizationId = 10L;
        Long employeeId = 99L;

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(organizationId);

        when(employeeRepository.findByIdAndUser_Organization_Id(
                employeeId, organizationId))
                .thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> employeeService.getEmployee(employeeId)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());

        verify(employeeRepository)
                .findByIdAndUser_Organization_Id(
                        employeeId, organizationId);
    }

    @Test
    void getEmployeeRejectsNullIdWithoutDatabaseLookup() {
        assertThrows(
                ResponseStatusException.class,
                () -> employeeService.getEmployee(null)
        );

        verifyNoInteractions(
                employeeRepository,
                currentTenantService
        );
    }

    @Test
    void getEmployeeRejectsNonPositiveIdWithoutDatabaseLookup() {
        assertThrows(
                ResponseStatusException.class,
                () -> employeeService.getEmployee(0L)
        );

        assertThrows(
                ResponseStatusException.class,
                () -> employeeService.getEmployee(-1L)
        );

        verifyNoInteractions(
                employeeRepository,
                currentTenantService
        );
    }

    @Test
    void updateEmployeeChangesRequestedProfileFields() {
        Long organizationId = 10L;
        Long employeeId = 25L;

        Employee employee =
                org.mockito.Mockito.mock(Employee.class);

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(organizationId);

        when(employeeRepository.findByIdAndUser_Organization_Id(
                employeeId, organizationId))
                .thenReturn(Optional.of(employee));

        when(employeeRepository.save(employee))
                .thenReturn(employee);

        LocalDate hireDate = LocalDate.of(2026, 1, 15);

        Employee actualEmployee = employeeService.updateEmployee(
                employeeId,
                "Updated",
                "Employee",
                "123456789",
                "Developer",
                "Engineering",
                hireDate
        );

        assertSame(employee, actualEmployee);

        verify(employee).setFirstName("Updated");
        verify(employee).setLastName("Employee");
        verify(employee).setPhone("123456789");
        verify(employee).setJobTitle("Developer");
        verify(employee).setDepartment("Engineering");
        verify(employee).setHireDate(hireDate);

        verify(employeeRepository).save(employee);
    }

    @Test
    void updateEmployeeCannotUpdateEmployeeOutsideOrganization() {
        Long organizationId = 10L;
        Long employeeId = 99L;

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(organizationId);

        when(employeeRepository.findByIdAndUser_Organization_Id(
                employeeId, organizationId))
                .thenReturn(Optional.empty());

        assertThrows(
                ResponseStatusException.class,
                () -> employeeService.updateEmployee(
                        employeeId,
                        "Updated",
                        "Employee",
                        null,
                        null,
                        null,
                        null
                )
        );

        verify(employeeRepository, never())
                .save(any(Employee.class));
    }

    @Test
    void updateEmployeeStatusChangesLinkedUserStatus() {
        Long organizationId = 10L;
        Long employeeId = 25L;

        Employee employee =
                org.mockito.Mockito.mock(Employee.class);

        User user = org.mockito.Mockito.mock(User.class);

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(organizationId);

        when(employeeRepository.findByIdAndUser_Organization_Id(
                employeeId, organizationId))
                .thenReturn(Optional.of(employee));

        when(employee.getUser()).thenReturn(user);

        employeeService.updateEmployeeStatus(
                employeeId,
                User.Status.DISABLED
        );

        verify(user).setStatus(User.Status.DISABLED);
    }

    @Test
    void updateEmployeeStatusCannotChangeEmployeeOutsideOrganization() {
        Long organizationId = 10L;
        Long employeeId = 99L;

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(organizationId);

        when(employeeRepository.findByIdAndUser_Organization_Id(
                employeeId, organizationId))
                .thenReturn(Optional.empty());

        assertThrows(
                ResponseStatusException.class,
                () -> employeeService.updateEmployeeStatus(
                        employeeId,
                        User.Status.DISABLED
                )
        );

        verify(employeeRepository, never())
                .save(any(Employee.class));

        verifyNoInteractions(userRepository);
    }

    @Test
    void createEmployeeSavesEmployeeForAuthenticatedOrganization() {
        Long organizationId = 10L;
        Organization organization =
                new Organization("WorkSphere Test Org");

        String rawPassword = "SecurePassword123!";
        String encodedPassword = "encoded-password";

        when(userRepository.findByEmail("employee@example.com"))
                .thenReturn(Optional.empty());

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(organizationId);

        when(organizationRepository.findById(organizationId))
                .thenReturn(Optional.of(organization));

        when(passwordEncoder.encode(rawPassword))
                .thenReturn(encodedPassword);

        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(employeeRepository.save(any(Employee.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Employee employee = employeeService.createEmployee(
                " Rahul ",
                " Sharma ",
                " Employee@Example.com ",
                rawPassword,
                "9876543210",
                "Developer",
                "Engineering",
                LocalDate.of(2026, 10, 1)
        );

        assertNotNull(employee);
        assertEquals("Rahul", employee.getFirstName());
        assertEquals("Sharma", employee.getLastName());
        assertNotNull(employee.getUser());
        assertEquals("employee@example.com", employee.getUser().getEmail());
        assertEquals(User.Role.EMPLOYEE, employee.getUser().getRole());
        assertEquals(User.Status.ACTIVE, employee.getUser().getStatus());
       assertEquals(encodedPassword, employee.getUser().getPasswordHash());

        verify(currentTenantService).getCurrentOrganizationId();
        verify(organizationRepository).findById(organizationId);
        verify(passwordEncoder).encode(rawPassword);
        verify(userRepository).save(employee.getUser());
        verify(employeeRepository).save(employee);
    }

    @Test
    void createEmployeeRejectsDuplicateEmail() {
        User existingUser = org.mockito.Mockito.mock(User.class);

        when(userRepository.findByEmail("employee@example.com"))
                .thenReturn(Optional.of(existingUser));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> employeeService.createEmployee(
                        "Rahul",
                        "Sharma",
                        "employee@example.com",
                        "SecurePassword123!",
                        null,
                        null,
                        null,
                        null
                )
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());

        verify(userRepository, never()).save(any(User.class));

        verifyNoInteractions(
                currentTenantService,
                organizationRepository,
                passwordEncoder,
                employeeRepository
        );
    }

    @Test
    void createEmployeeRejectsShortPassword() {
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> employeeService.createEmployee(
                        "Rahul",
                        "Sharma",
                        "employee@example.com",
                        "short",
                        null,
                        null,
                        null,
                        null
                )
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());

        verifyNoInteractions(
                userRepository,
                organizationRepository,
                currentTenantService,
                passwordEncoder,
                employeeRepository
        );
    }

    @Test
    void createEmployeeRejectsMissingOrganization() {
        Long organizationId = 10L;
        String rawPassword = "SecurePassword123!";

        when(userRepository.findByEmail("employee@example.com"))
                .thenReturn(Optional.empty());

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(organizationId);

        when(organizationRepository.findById(organizationId))
                .thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> employeeService.createEmployee(
                        "Rahul",
                        "Sharma",
                        "employee@example.com",
                        rawPassword,
                        null,
                        null,
                        null,
                        null
                )
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());

        verify(userRepository, never()).save(any(User.class));
        verify(employeeRepository, never()).save(any(Employee.class));
    }
}
