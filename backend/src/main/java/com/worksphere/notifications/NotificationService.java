package com.worksphere.notifications;

import com.worksphere.notifications.dto.NotificationResponse;
import com.worksphere.security.CurrentTenantService;
import com.worksphere.tasks.Task;
import com.worksphere.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final CurrentTenantService currentTenantService;

    public NotificationService(
            NotificationRepository notificationRepository,
            CurrentTenantService currentTenantService
    ) {
        this.notificationRepository = notificationRepository;
        this.currentTenantService = currentTenantService;
    }

    @Transactional
    public void createTaskAssignedNotification(Task task) {
        User recipient = task.getAssignee().getUser();

        Notification notification = new Notification(
                recipient,
                task,
                "New task assigned",
                "You have been assigned a task: " + task.getTitle()
        );

        notificationRepository.save(notification);
    }

    @Transactional
    public void createTaskMessageNotification(Task task, User sender) {

        User creator = task.getCreatedBy();
        User assignee = task.getAssignee().getUser();

        User recipient;

        if (creator.getId().equals(sender.getId())) {
            recipient = assignee;
        } else if (assignee.getId().equals(sender.getId())) {
            recipient = creator;
        } else {
            throw new IllegalArgumentException(
                    "Sender is not a participant in this task"
            );
        }

        Notification notification = new Notification(
                recipient,
                task,
                Notification.Type.TASK_MESSAGE,
                "New task message",
                "You have a new message in task: " + task.getTitle()
        );

        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications() {
        Long userId = currentTenantService.getCurrentUserId();
        Long organizationId =
                currentTenantService.getCurrentOrganizationId();

        return notificationRepository
                .findAllByRecipient_IdAndRecipient_Organization_IdOrderByCreatedAtDesc(
                        userId,
                        organizationId
                )
                .stream()
                .map(NotificationResponse::from)
                .toList();
    }

    @Transactional
    public NotificationResponse markAsRead(Long notificationId) {
        if (notificationId == null || notificationId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Notification ID must be a positive number"
            );
        }

        Long userId = currentTenantService.getCurrentUserId();
        Long organizationId =
                currentTenantService.getCurrentOrganizationId();

        Notification notification = notificationRepository
                .findByIdAndRecipient_IdAndRecipient_Organization_Id(
                        notificationId,
                        userId,
                        organizationId
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Notification not found"
                ));

        notification.markAsRead();

        return NotificationResponse.from(notification);
    }
}