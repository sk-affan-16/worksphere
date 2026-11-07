package com.worksphere.notifications;

import com.worksphere.employee.Employee;
import com.worksphere.security.CurrentTenantService;
import com.worksphere.tasks.Task;
import com.worksphere.user.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private CurrentTenantService currentTenantService;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    void createTaskAssignedNotificationShouldUseActualAssignee() {
        User recipient = mock(User.class);
        Employee employee = mock(Employee.class);
        Task task = mock(Task.class);

        when(task.getAssignee()).thenReturn(employee);
        when(employee.getUser()).thenReturn(recipient);
        when(task.getTitle()).thenReturn("Complete onboarding");

        notificationService.createTaskAssignedNotification(task);

        ArgumentCaptor<Notification> captor =
                ArgumentCaptor.forClass(Notification.class);

        verify(notificationRepository).save(captor.capture());

        Notification saved = captor.getValue();

        assertSame(recipient, saved.getRecipient());
        assertSame(task, saved.getTask());
        assertEquals(Notification.Type.TASK_ASSIGNED, saved.getType());
        assertEquals("New task assigned", saved.getTitle());
        assertTrue(saved.getMessage().contains("Complete onboarding"));
        assertFalse(saved.isRead());
    }

    @Test
    void getMyNotificationsShouldUseAuthenticatedUserAndOrganization() {
        when(currentTenantService.getCurrentUserId()).thenReturn(100L);
        when(currentTenantService.getCurrentOrganizationId()).thenReturn(1L);

        Notification notification = mock(Notification.class);
        Task task = mock(Task.class);

        when(notification.getId()).thenReturn(10L);
        when(notification.getTitle()).thenReturn("New task assigned");
        when(notification.getMessage()).thenReturn("A task was assigned");
        when(notification.getType()).thenReturn(Notification.Type.TASK_ASSIGNED);
        when(notification.isRead()).thenReturn(false);
        when(notification.getCreatedAt()).thenReturn(Instant.parse("2026-11-07T00:00:00Z"));
        when(notification.getTask()).thenReturn(task);
        when(task.getId()).thenReturn(50L);

        when(notificationRepository
                .findAllByRecipient_IdAndRecipient_Organization_IdOrderByCreatedAtDesc(
                        100L, 1L
                ))
                .thenReturn(List.of(notification));

        var result = notificationService.getMyNotifications();

        assertEquals(1, result.size());
        assertEquals(10L, result.get(0).id());
        assertEquals(50L, result.get(0).taskId());
        assertFalse(result.get(0).read());

        verify(notificationRepository)
                .findAllByRecipient_IdAndRecipient_Organization_IdOrderByCreatedAtDesc(
                        100L, 1L
                );
    }

    @Test
    void markAsReadShouldUpdateNotificationBelongingToCurrentUser() {
        when(currentTenantService.getCurrentUserId()).thenReturn(100L);
        when(currentTenantService.getCurrentOrganizationId()).thenReturn(1L);

        Notification notification = mock(Notification.class);
        Task task = mock(Task.class);

        when(notificationRepository
                .findByIdAndRecipient_IdAndRecipient_Organization_Id(
                        10L, 100L, 1L
                ))
                .thenReturn(Optional.of(notification));

        when(notification.getId()).thenReturn(10L);
        when(notification.getTitle()).thenReturn("New task assigned");
        when(notification.getMessage()).thenReturn("A task was assigned");
        when(notification.getType()).thenReturn(Notification.Type.TASK_ASSIGNED);
        when(notification.isRead()).thenReturn(true);
        when(notification.getCreatedAt()).thenReturn(Instant.now());
        when(notification.getTask()).thenReturn(task);
        when(task.getId()).thenReturn(50L);

        var result = notificationService.markAsRead(10L);

        verify(notification).markAsRead();
        verify(notificationRepository)
                .findByIdAndRecipient_IdAndRecipient_Organization_Id(
                        10L, 100L, 1L
                );

        assertEquals(10L, result.id());
        assertTrue(result.read());
    }

    @Test
    void markAsReadShouldReturnNotFoundForAnotherUsersNotification() {
        when(currentTenantService.getCurrentUserId()).thenReturn(100L);
        when(currentTenantService.getCurrentOrganizationId()).thenReturn(1L);

        when(notificationRepository
                .findByIdAndRecipient_IdAndRecipient_Organization_Id(
                        20L, 100L, 1L
                ))
                .thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> notificationService.markAsRead(20L)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());

        verify(notificationRepository)
                .findByIdAndRecipient_IdAndRecipient_Organization_Id(
                        20L, 100L, 1L
                );
    }
}