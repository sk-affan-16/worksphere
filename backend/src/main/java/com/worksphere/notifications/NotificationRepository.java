package com.worksphere.notifications;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    @EntityGraph(attributePaths = {"task"})
    List<Notification>
    findAllByRecipient_IdAndRecipient_Organization_IdOrderByCreatedAtDesc(
            Long recipientId,
            Long organizationId
    );

    Optional<Notification>
    findByIdAndRecipient_IdAndRecipient_Organization_Id(
            Long notificationId,
            Long recipientId,
            Long organizationId
    );
}
