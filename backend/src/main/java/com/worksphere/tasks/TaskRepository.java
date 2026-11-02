
package com.worksphere.tasks;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Retrieves every task belonging to the current organization.
     * Intended for organization administrators.
     */
    @EntityGraph(attributePaths = {
            "assignee",
            "assignee.user"
    })
    List<Task> findAllByAssignee_User_Organization_IdOrderByCreatedAtDesc(
            Long organizationId
    );

    /**
     * Retrieves only tasks assigned to the authenticated employee
     * within the authenticated organization.
     */
    @EntityGraph(attributePaths = {
            "assignee",
            "assignee.user"
    })
    List<Task> findAllByAssignee_User_IdAndAssignee_User_Organization_IdOrderByCreatedAtDesc(
            Long userId,
            Long organizationId
    );

    /**
     * Finds a task only when it belongs to the current organization.
     * Used by organization administrators.
     */
    @EntityGraph(attributePaths = {
            "assignee",
            "assignee.user"
    })
    Optional<Task> findByIdAndAssignee_User_Organization_Id(
            Long taskId,
            Long organizationId
    );

    /**
     * Finds a task only when it belongs to the authenticated employee
     * and the current organization.
     */
    @EntityGraph(attributePaths = {
            "assignee",
            "assignee.user"
    })
    Optional<Task> findByIdAndAssignee_User_IdAndAssignee_User_Organization_Id(
            Long taskId,
            Long userId,
            Long organizationId
    );
}
