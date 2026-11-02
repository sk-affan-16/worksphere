
package com.worksphere.tasks;

import com.worksphere.tasks.dto.CreateTaskRequest;
import com.worksphere.tasks.dto.TaskResponse;
import com.worksphere.tasks.dto.UpdateTaskStatusRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /**
     * Creates a task and assigns it using an employee's email.
     * Only organization administrators can create tasks.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public TaskResponse createTask(
            @Valid @RequestBody CreateTaskRequest request
    ) {
        return taskService.createTask(
                request.title(),
                request.assigneeEmail(),
                request.dueDate(),
                request.priority()
        );
    }

    /**
     * Returns all tasks belonging to the current organization.
     * Only organization administrators can access this endpoint.
     */
    @GetMapping
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public List<TaskResponse> getOrganizationTasks() {
        return taskService.getOrganizationTasks();
    }

    /**
     * Returns only the tasks assigned to the authenticated employee.
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public List<TaskResponse> getMyTasks() {
        return taskService.getMyTasks();
    }

    /**
     * Updates task status.
     *
     * Administrators can update tasks in their organization.
     * Employees can update only their own assigned tasks.
     */
    @PatchMapping("/{taskId}/status")
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'EMPLOYEE')")
    public TaskResponse updateTaskStatus(
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskStatusRequest request
    ) {
        return taskService.updateTaskStatus(
                taskId,
                request.status()
        );
    }
}
