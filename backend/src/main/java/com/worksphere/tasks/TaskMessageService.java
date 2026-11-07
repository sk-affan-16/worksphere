package com.worksphere.tasks;

import com.worksphere.notifications.NotificationService;
import com.worksphere.security.CurrentTenantService;
import com.worksphere.tasks.dto.TaskMessageRequest;
import com.worksphere.tasks.dto.TaskMessageResponse;
import com.worksphere.user.User;
import com.worksphere.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TaskMessageService {

    private final TaskMessageRepository messageRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final CurrentTenantService currentTenantService;
    private final NotificationService notificationService;

    public TaskMessageService(
            TaskMessageRepository messageRepository,
            TaskRepository taskRepository,
            UserRepository userRepository,
            CurrentTenantService currentTenantService,
            NotificationService notificationService
    ) {
        this.messageRepository = messageRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.currentTenantService = currentTenantService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<TaskMessageResponse> getMessages(Long taskId) {

        Task task = getAuthorizedTask(taskId);

        return messageRepository
                .findAllByTask_IdOrderByCreatedAtAscIdAsc(task.getId())
                .stream()
                .map(TaskMessageResponse::from)
                .toList();
    }

    @Transactional
    public TaskMessageResponse sendMessage(
            Long taskId,
            TaskMessageRequest request
    ) {

        Task task = getAuthorizedTask(taskId);

        Long currentUserId = currentTenantService.getCurrentUserId();

        User sender = userRepository.findById(currentUserId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Authenticated user not found")
                );

        String content = request.content().trim();

        if (content.isBlank()) {
            throw new IllegalArgumentException("Message cannot be empty");
        }

        if (content.length() > 2000) {
            throw new IllegalArgumentException(
                    "Message cannot exceed 2000 characters"
            );
        }

        TaskMessage message = new TaskMessage(task, sender, content);

        TaskMessage savedMessage = messageRepository.save(message);

        notificationService.createTaskMessageNotification(task, sender);

        return TaskMessageResponse.from(savedMessage);
    }

    private Task getAuthorizedTask(Long taskId) {

        Long organizationId =
                currentTenantService.getCurrentOrganizationId();

        Long currentUserId =
                currentTenantService.getCurrentUserId();

        Task task = taskRepository
                .findByIdAndAssignee_User_Organization_Id(
                        taskId,
                        organizationId
                )
                .orElseThrow(() ->
                        new EntityNotFoundException("Task not found")
                );

        Long creatorId = task.getCreatedBy().getId();

        Long assignedEmployeeUserId =
                task.getAssignee().getUser().getId();

        boolean isTaskCreator = creatorId.equals(currentUserId);

        boolean isAssignedEmployee =
                assignedEmployeeUserId.equals(currentUserId);

        if (!isTaskCreator && !isAssignedEmployee) {
            throw new AccessDeniedException(
                    "You are not allowed to access this task conversation"
            );
        }

        return task;
    }
}