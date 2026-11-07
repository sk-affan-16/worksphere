package com.worksphere.tasks;

import com.worksphere.tasks.dto.TaskMessageRequest;
import com.worksphere.tasks.dto.TaskMessageResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks/{taskId}/messages")
public class TaskMessageController {

    private final TaskMessageService taskMessageService;

    public TaskMessageController(TaskMessageService taskMessageService) {
        this.taskMessageService = taskMessageService;
    }

    @GetMapping
    public List<TaskMessageResponse> getMessages(
            @PathVariable Long taskId
    ) {
        return taskMessageService.getMessages(taskId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskMessageResponse sendMessage(
            @PathVariable Long taskId,
            @Valid @RequestBody TaskMessageRequest request
    ) {
        return taskMessageService.sendMessage(taskId, request);
    }
}