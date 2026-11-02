
package com.worksphere.tasks.dto;

import com.worksphere.tasks.Task;

import java.time.Instant;
import java.time.LocalDate;

public record TaskResponse(
        Long id,
        String title,
        Long assigneeEmployeeId,
        String assigneeName,
        String assigneeEmail,
        String department,
        LocalDate dueDate,
        Task.Priority priority,
        Task.Status status,
        Instant createdAt,
        Instant updatedAt
) {

    public static TaskResponse from(Task task) {
        var employee = task.getAssignee();
        var user = employee.getUser();

        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                employee.getId(),
                employee.getFirstName() + " " + employee.getLastName(),
                user.getEmail(),
                employee.getDepartment(),
                task.getDueDate(),
                task.getPriority(),
                task.getStatus(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
