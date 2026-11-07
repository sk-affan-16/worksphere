package com.worksphere.notifications.dto;

import com.worksphere.notifications.Notification;

import java.time.Instant;

public record NotificationResponse(
        Long id,
        String title,
        String message,
        String type,
        boolean read,
        Instant createdAt,
        Long taskId
) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType().name(),
                notification.isRead(),
                notification.getCreatedAt(),
                notification.getTask().getId()
        );
    }
}
