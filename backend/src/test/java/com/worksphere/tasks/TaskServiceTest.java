
package com.worksphere.tasks;

import com.worksphere.employee.Employee;
import com.worksphere.employee.EmployeeRepository;
import com.worksphere.organization.Organization;
import com.worksphere.security.CurrentTenantService;
import com.worksphere.tasks.dto.TaskResponse;
import com.worksphere.user.User;
import com.worksphere.user.UserRepository;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CurrentTenantService currentTenantService;

    @InjectMocks
    private TaskService taskService;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticate(String role) {
        var authentication =
                new UsernamePasswordAuthenticationToken(
                        "test@worksphere.local",
                        null,
                        List.of(
                                new SimpleGrantedAuthority("ROLE_" + role)
                        )
                );

        SecurityContextHolder.getContext()
                .setAuthentication(authentication);
    }

    /**
     * Creates only the organization-related stubs.
     * Each test adds only the stubs it actually requires.
     */
    private User createUserInOrganization(Long organizationId) {
        User user = mock(User.class);
        Organization organization = mock(Organization.class);

        when(user.getOrganization()).thenReturn(organization);
        when(organization.getId()).thenReturn(organizationId);

        return user;
    }

    private Employee createEmployeeProfile(User user) {
        Employee employee = mock(Employee.class);

        when(employee.getId()).thenReturn(10L);
        when(employee.getFirstName()).thenReturn("Alice");
        when(employee.getLastName()).thenReturn("Smith");
        when(employee.getDepartment()).thenReturn("Engineering");
        when(employee.getUser()).thenReturn(user);

        return employee;
    }

    private Task createTestTask() {
        User user = mock(User.class);

        when(user.getEmail()).thenReturn("alice@example.com");

        Employee employee = createEmployeeProfile(user);

        return new Task(
                employee,
                "Complete onboarding",
                LocalDate.of(2026, 11, 15),
                Task.Priority.HIGH
        );
    }

    @Test
    void createTaskShouldResolveEmployeeByEmailAndSaveTask() {

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(1L);

        User user = createUserInOrganization(1L);

        when(user.getId()).thenReturn(100L);
        when(user.getEmail()).thenReturn("alice@example.com");
        when(user.getRole()).thenReturn(User.Role.EMPLOYEE);
        when(user.getStatus()).thenReturn(User.Status.ACTIVE);

        Employee employee = createEmployeeProfile(user);

        when(userRepository.findByEmail("alice@example.com"))
                .thenReturn(Optional.of(user));

        when(employeeRepository.findByUser_Id(100L))
                .thenReturn(Optional.of(employee));

        when(taskRepository.save(any(Task.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        TaskResponse response = taskService.createTask(
                "  Complete onboarding  ",
                " ALICE@example.com ",
                LocalDate.of(2026, 11, 15),
                Task.Priority.HIGH
        );

        assertNotNull(response);
        assertEquals("Complete onboarding", response.title());
        assertEquals(10L, response.assigneeEmployeeId());
        assertEquals("Alice Smith", response.assigneeName());
        assertEquals("alice@example.com", response.assigneeEmail());
        assertEquals("Engineering", response.department());
        assertEquals(Task.Priority.HIGH, response.priority());
        assertEquals(Task.Status.TO_DO, response.status());

        verify(userRepository).findByEmail("alice@example.com");
        verify(employeeRepository).findByUser_Id(100L);
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    void createTaskShouldRejectEmployeeFromAnotherOrganization() {

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(1L);

        User user = createUserInOrganization(2L);

        when(userRepository.findByEmail("alice@example.com"))
                .thenReturn(Optional.of(user));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> taskService.createTask(
                        "Test task",
                        "alice@example.com",
                        LocalDate.of(2026, 11, 15),
                        Task.Priority.MEDIUM
                )
        );

        assertEquals(
                HttpStatus.NOT_FOUND,
                exception.getStatusCode()
        );

        verify(employeeRepository, never()).findByUser_Id(any());
        verify(taskRepository, never()).save(any());
    }

    @Test
    void createTaskShouldRejectDisabledEmployee() {

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(1L);

        User user = createUserInOrganization(1L);

        when(user.getRole()).thenReturn(User.Role.EMPLOYEE);
        when(user.getStatus()).thenReturn(User.Status.DISABLED);

        when(userRepository.findByEmail("alice@example.com"))
                .thenReturn(Optional.of(user));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> taskService.createTask(
                        "Test task",
                        "alice@example.com",
                        LocalDate.of(2026, 11, 15),
                        Task.Priority.MEDIUM
                )
        );

        assertEquals(
                HttpStatus.CONFLICT,
                exception.getStatusCode()
        );

        verify(employeeRepository, never()).findByUser_Id(any());
        verify(taskRepository, never()).save(any());
    }

    @Test
    void createTaskShouldRejectAdministratorAsAssignee() {

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(1L);

        User user = createUserInOrganization(1L);

        when(user.getRole()).thenReturn(User.Role.ORG_ADMIN);

        when(userRepository.findByEmail("alice@example.com"))
                .thenReturn(Optional.of(user));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> taskService.createTask(
                        "Test task",
                        "alice@example.com",
                        LocalDate.of(2026, 11, 15),
                        Task.Priority.MEDIUM
                )
        );

        assertEquals(
                HttpStatus.NOT_FOUND,
                exception.getStatusCode()
        );

        verify(employeeRepository, never()).findByUser_Id(any());
        verify(taskRepository, never()).save(any());
    }

    @Test
    void createTaskShouldRejectUnknownEmail() {

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(1L);

        when(userRepository.findByEmail("unknown@example.com"))
                .thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> taskService.createTask(
                        "Test task",
                        "unknown@example.com",
                        LocalDate.of(2026, 11, 15),
                        Task.Priority.MEDIUM
                )
        );

        assertEquals(
                HttpStatus.NOT_FOUND,
                exception.getStatusCode()
        );

        verify(employeeRepository, never()).findByUser_Id(any());
        verify(taskRepository, never()).save(any());
    }

    @Test
    void getOrganizationTasksShouldQueryOnlyCurrentOrganization() {

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(7L);

        when(taskRepository
                .findAllByAssignee_User_Organization_IdOrderByCreatedAtDesc(7L))
                .thenReturn(List.of());

        List<TaskResponse> result =
                taskService.getOrganizationTasks();

        assertTrue(result.isEmpty());

        verify(taskRepository)
                .findAllByAssignee_User_Organization_IdOrderByCreatedAtDesc(
                        7L
                );
    }

    @Test
    void getMyTasksShouldQueryOnlyAuthenticatedEmployeeAndOrganization() {

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(7L);

        when(currentTenantService.getCurrentUserId())
                .thenReturn(100L);

        when(taskRepository
                .findAllByAssignee_User_IdAndAssignee_User_Organization_IdOrderByCreatedAtDesc(
                        100L,
                        7L
                ))
                .thenReturn(List.of());

        List<TaskResponse> result = taskService.getMyTasks();

        assertTrue(result.isEmpty());

        verify(taskRepository)
                .findAllByAssignee_User_IdAndAssignee_User_Organization_IdOrderByCreatedAtDesc(
                        100L,
                        7L
                );
    }

    @Test
    void administratorShouldUpdateTaskInsideOwnOrganization() {

        authenticate("ORG_ADMIN");

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(1L);

        when(currentTenantService.getCurrentUserId())
                .thenReturn(50L);

        Task task = createTestTask();

        when(taskRepository
                .findByIdAndAssignee_User_Organization_Id(5L, 1L))
                .thenReturn(Optional.of(task));

        when(taskRepository.save(task)).thenReturn(task);

        TaskResponse response = taskService.updateTaskStatus(
                5L,
                Task.Status.COMPLETED
        );

        assertEquals(
                Task.Status.COMPLETED,
                response.status()
        );

        verify(taskRepository)
                .findByIdAndAssignee_User_Organization_Id(5L, 1L);

        verify(taskRepository).save(task);
    }

    @Test
    void employeeShouldUpdateOwnAssignedTask() {

        authenticate("EMPLOYEE");

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(1L);

        when(currentTenantService.getCurrentUserId())
                .thenReturn(100L);

        Task task = createTestTask();

        when(taskRepository
                .findByIdAndAssignee_User_IdAndAssignee_User_Organization_Id(
                        5L,
                        100L,
                        1L
                ))
                .thenReturn(Optional.of(task));

        when(taskRepository.save(task)).thenReturn(task);

        TaskResponse response = taskService.updateTaskStatus(
                5L,
                Task.Status.IN_PROGRESS
        );

        assertEquals(
                Task.Status.IN_PROGRESS,
                response.status()
        );

        verify(taskRepository)
                .findByIdAndAssignee_User_IdAndAssignee_User_Organization_Id(
                        5L,
                        100L,
                        1L
                );

        verify(taskRepository).save(task);
    }

    @Test
    void employeeShouldNotUpdateAnotherEmployeesTask() {

        authenticate("EMPLOYEE");

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(1L);

        when(currentTenantService.getCurrentUserId())
                .thenReturn(200L);

        when(taskRepository
                .findByIdAndAssignee_User_IdAndAssignee_User_Organization_Id(
                        5L,
                        200L,
                        1L
                ))
                .thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> taskService.updateTaskStatus(
                        5L,
                        Task.Status.COMPLETED
                )
        );

        assertEquals(
                HttpStatus.NOT_FOUND,
                exception.getStatusCode()
        );

        verify(taskRepository, never()).save(any(Task.class));
    }

    @Test
    void updateTaskStatusShouldRejectInvalidTaskId() {

        authenticate("ORG_ADMIN");

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> taskService.updateTaskStatus(
                        0L,
                        Task.Status.COMPLETED
                )
        );

        assertEquals(
                HttpStatus.BAD_REQUEST,
                exception.getStatusCode()
        );

        verifyNoInteractions(taskRepository);
    }
}
