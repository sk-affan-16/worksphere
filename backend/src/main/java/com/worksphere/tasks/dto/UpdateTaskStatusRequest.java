
package com.worksphere.tasks.dto;

import com.worksphere.tasks.Task;
import jakarta.validation.constraints.NotNull;

public record UpdateTaskStatusRequest(

        @NotNull(message = "Task status is required")
        Task.Status status

) {
}
