package com.worksphere.tasks.dto;

import com.worksphere.tasks.TaskMessage;

import java.time.Instant;

public record TaskMessageResponse(
        Long id,
        Long taskId,
        Long senderId,
        String senderEmail,
        String content,
        Instant createdAt
) {

    public static TaskMessageResponse from(TaskMessage message) {
        return new TaskMessageResponse(
                message.getId(),
                message.getTask().getId(),
                message.getSender().getId(),
                message.getSender().getEmail(),
                message.getContent(),
                message.getCreatedAt()
        );
    }
}