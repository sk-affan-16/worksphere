package com.worksphere.notifications;

import com.worksphere.tasks.Task;
import com.worksphere.user.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notification_recipient_created",
                columnList = "recipient_user_id, created_at")
})
public class Notification {


    public enum Type {
        TASK_ASSIGNED,
        TASK_MESSAGE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_user_id", nullable = false)
    private User recipient;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private Type type;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Notification() {
        // Required by JPA
    }

    public Notification(User recipient, Task task, String title, String message) {
        this(recipient, task, Type.TASK_ASSIGNED, title, message);
    }

    public Notification(
            User recipient,
            Task task,
            Type type,
            String title,
            String message
    ) {
        if (recipient == null || task == null || type == null) {
            throw new IllegalArgumentException(
                    "Notification recipient, task and type are required"
            );
        }

        this.recipient = recipient;
        this.task = task;
        this.type = type;
        this.title = title;
        this.message = message;
    }

    public Long getId() {
        return id;
    }

    public User getRecipient() {
        return recipient;
    }

    public Task getTask() {
        return task;
    }

    public Type getType() {
        return type;
    }

    public String getTitle() {
        return title;
    }

    public String getMessage() {
        return message;
    }

    public boolean isRead() {
        return read;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void markAsRead() {
        this.read = true;
    }
}