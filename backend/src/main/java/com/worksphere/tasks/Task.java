
package com.worksphere.tasks;

import com.worksphere.employee.Employee;
import com.worksphere.user.User;
import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "tasks")
public class Task {

    public enum Status {
        TO_DO,
        IN_PROGRESS,
        COMPLETED
    }

    public enum Priority {
        LOW,
        MEDIUM,
        HIGH
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assignee_employee_id", nullable = false)
    private Employee assignee;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Priority priority = Priority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.TO_DO;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected Task() {
        // Required by JPA
    }

    public Task(
            Employee assignee,
            User createdBy,
            String title,
            LocalDate dueDate,
            Priority priority
    ) {
        if (assignee == null) {
            throw new IllegalArgumentException("Task assignee is required");
        }

        if (createdBy == null) {
            throw new IllegalArgumentException("Task creator is required");
        }

        this.assignee = assignee;
        this.createdBy = createdBy;

        setTitle(title);
        setDueDate(dueDate);
        setPriority(priority);

        this.status = Status.TO_DO;
    }

    public Long getId() {
        return id;
    }

    public Employee getAssignee() {
        return assignee;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public String getTitle() {
        return title;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public Priority getPriority() {
        return priority;
    }

    public Status getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setTitle(String title) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Task title is required");
        }

        String normalizedTitle = title.trim();

        if (normalizedTitle.length() > 200) {
            throw new IllegalArgumentException(
                    "Task title must not exceed 200 characters"
            );
        }

        this.title = normalizedTitle;
    }

    public void setDueDate(LocalDate dueDate) {
        if (dueDate == null) {
            throw new IllegalArgumentException("Task due date is required");
        }

        this.dueDate = dueDate;
    }

    public void setPriority(Priority priority) {
        if (priority == null) {
            throw new IllegalArgumentException("Task priority is required");
        }

        this.priority = priority;
    }

    public void updateStatus(Status status) {
        if (status == null) {
            throw new IllegalArgumentException("Task status is required");
        }

        this.status = status;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
