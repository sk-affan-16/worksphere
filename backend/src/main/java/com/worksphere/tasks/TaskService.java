
package com.worksphere.tasks;

import com.worksphere.employee.Employee;
import com.worksphere.employee.EmployeeRepository;
import com.worksphere.security.CurrentTenantService;
import com.worksphere.tasks.dto.TaskResponse;
import com.worksphere.user.User;
import com.worksphere.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final CurrentTenantService currentTenantService;

    public TaskService(
            TaskRepository taskRepository,
            EmployeeRepository employeeRepository,
            UserRepository userRepository,
            CurrentTenantService currentTenantService
    ) {
        this.taskRepository = taskRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.currentTenantService = currentTenantService;
    }

    /**
     * Creates a task for an active employee in the current organization.
     * Only organization administrators can create tasks.
     */
    @Transactional
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public TaskResponse createTask(
            String title,
            String assigneeEmail,
            java.time.LocalDate dueDate,
            Task.Priority priority
    ) {
        Long organizationId =
                currentTenantService.getCurrentOrganizationId();

        String normalizedEmail = normalizeEmail(assigneeEmail);

        if (priority == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Task priority is required"
            );
        }

        // Look up the account using its normalized email.
        User assigneeUser = userRepository
                .findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Active employee not found in your organization"
                ));

        // Never allow assignment across organizations.
        if (!organizationId.equals(
                assigneeUser.getOrganization().getId())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Active employee not found in your organization"
            );
        }

        // Only employee accounts can receive tasks.
        if (assigneeUser.getRole() != User.Role.EMPLOYEE) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Active employee not found in your organization"
            );
        }

        // Disabled employee accounts cannot receive new tasks.
        if (assigneeUser.getStatus() != User.Status.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Tasks cannot be assigned to a disabled employee"
            );
        }

        // Resolve the actual employee profile using the verified user ID.
        Employee employee = employeeRepository
                .findByUser_Id(assigneeUser.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee profile not found"
                ));

        Task task = new Task(
                employee,
                title,
                dueDate,
                priority
        );

        Task savedTask = taskRepository.save(task);

        // Convert to DTO while the transaction is still active.
        return TaskResponse.from(savedTask);
    }

    /**
     * Returns all tasks belonging to the administrator's organization.
     */
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public List<TaskResponse> getOrganizationTasks() {
        Long organizationId =
                currentTenantService.getCurrentOrganizationId();

        return taskRepository
                .findAllByAssignee_User_Organization_IdOrderByCreatedAtDesc(
                        organizationId
                )
                .stream()
                .map(TaskResponse::from)
                .toList();
    }

    /**
     * Returns only tasks assigned to the authenticated employee.
     */
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('EMPLOYEE')")
    public List<TaskResponse> getMyTasks() {
        Long organizationId =
                currentTenantService.getCurrentOrganizationId();

        Long userId =
                currentTenantService.getCurrentUserId();

        return taskRepository
                .findAllByAssignee_User_IdAndAssignee_User_Organization_IdOrderByCreatedAtDesc(
                        userId,
                        organizationId
                )
                .stream()
                .map(TaskResponse::from)
                .toList();
    }

    /**
     * Updates a task status.
     *
     * Administrators can update tasks belonging to their organization.
     * Employees can update only their own assigned tasks.
     */
    @Transactional
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'EMPLOYEE')")
    public TaskResponse updateTaskStatus(
            Long taskId,
            Task.Status status
    ) {
        if (taskId == null || taskId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Task ID must be a positive number"
            );
        }

        if (status == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Task status is required"
            );
        }

        Long organizationId =
                currentTenantService.getCurrentOrganizationId();

        Long userId =
                currentTenantService.getCurrentUserId();

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        boolean isAdmin = authentication != null
                && authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        "ROLE_ORG_ADMIN".equals(authority.getAuthority())
                );

        Task task;

        if (isAdmin) {
            task = taskRepository
                    .findByIdAndAssignee_User_Organization_Id(
                            taskId,
                            organizationId
                    )
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Task not found"
                    ));
        } else {
            task = taskRepository
                    .findByIdAndAssignee_User_IdAndAssignee_User_Organization_Id(
                            taskId,
                            userId,
                            organizationId
                    )
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Task not found"
                    ));
        }

        task.updateStatus(status);

        Task savedTask = taskRepository.save(task);

        return TaskResponse.from(savedTask);
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Assignee email is required"
            );
        }

        String normalizedEmail =
                email.trim().toLowerCase(Locale.ROOT);

        if (normalizedEmail.length() > 254
                || !normalizedEmail.matches(
                "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A valid assignee email is required"
            );
        }

        return normalizedEmail;
    }
}
