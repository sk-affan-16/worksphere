package com.worksphere.tasks;

import com.worksphere.employee.Employee;
import com.worksphere.employee.EmployeeRepository;
import com.worksphere.notifications.NotificationService;
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

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final CurrentTenantService currentTenantService;
    private final NotificationService notificationService;

    public TaskService(
            TaskRepository taskRepository,
            EmployeeRepository employeeRepository,
            UserRepository userRepository,
            CurrentTenantService currentTenantService,
            NotificationService notificationService
    ) {
        this.taskRepository = taskRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.currentTenantService = currentTenantService;
        this.notificationService = notificationService;
    }

    /**
     * Creates a task for an active employee in the current organization.
     * Only active organization administrators can create tasks.
     */
    @Transactional
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public TaskResponse createTask(
            String title,
            String assigneeEmail,
            LocalDate dueDate,
            Task.Priority priority
    ) {
        Long organizationId =
                currentTenantService.getCurrentOrganizationId();

        Long currentUserId =
                currentTenantService.getCurrentUserId();

        // Resolve the authenticated administrator from the database.
        User taskCreator = userRepository
                .findById(currentUserId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated task creator not found"
                ));

        // Verify the creator belongs to the current organization.
        if (!organizationId.equals(
                taskCreator.getOrganization().getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Task creator does not belong to your organization"
            );
        }

        if (taskCreator.getRole() != User.Role.ORG_ADMIN
                || taskCreator.getStatus() != User.Status.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only an active organization administrator can create tasks"
            );
        }

        String normalizedEmail = normalizeEmail(assigneeEmail);

        if (priority == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Task priority is required"
            );
        }

        User assigneeUser = userRepository
                .findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Active employee not found in your organization"
                ));

        if (!organizationId.equals(
                assigneeUser.getOrganization().getId())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Active employee not found in your organization"
            );
        }

        if (assigneeUser.getRole() != User.Role.EMPLOYEE) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Active employee not found in your organization"
            );
        }

        if (assigneeUser.getStatus() != User.Status.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Tasks cannot be assigned to a disabled employee"
            );
        }

        Employee employee = employeeRepository
                .findByUser_Id(assigneeUser.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee profile not found"
                ));

        // Save both the assigned employee and authenticated task creator.
        Task task = new Task(
                employee,
                taskCreator,
                title,
                dueDate,
                priority
        );

        Task savedTask = taskRepository.save(task);

        // Notify the actual task assignee.
        // This remains inside the task creation transaction.
        notificationService.createTaskAssignedNotification(savedTask);

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
