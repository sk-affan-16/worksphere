package com.worksphere.tasks;

import com.worksphere.user.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(
        name = "task_messages",
        indexes = {
                @Index(name = "idx_task_messages_task_created", columnList = "task_id, created_at")
        }
)
public class TaskMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_user_id", nullable = false)
    private User sender;

    @Column(nullable = false, length = 2000)
    private String content;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected TaskMessage() {
        // Required by JPA
    }

    public TaskMessage(Task task, User sender, String content) {
        this.task = task;
        this.sender = sender;
        this.content = content;
    }

    public Long getId() {
        return id;
    }

    public Task getTask() {
        return task;
    }

    public User getSender() {
        return sender;
    }

    public String getContent() {
        return content;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}