
package com.worksphere.tasks.dto;

import com.worksphere.tasks.Task;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateTaskRequest(

        @NotBlank(message = "Task title is required")
        @Size(max = 200, message = "Task title must not exceed 200 characters")
        String title,

        @NotBlank(message = "Assignee email is required")
        @Email(message = "A valid assignee email is required")
        @Size(max = 254, message = "Email must not exceed 254 characters")
        String assigneeEmail,

        @NotNull(message = "Due date is required")
        @FutureOrPresent(message = "Due date cannot be in the past")
        LocalDate dueDate,

        @NotNull(message = "Task priority is required")
        Task.Priority priority

) {
}
