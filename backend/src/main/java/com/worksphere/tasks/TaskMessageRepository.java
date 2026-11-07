package com.worksphere.tasks;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskMessageRepository
        extends JpaRepository<TaskMessage, Long> {

    List<TaskMessage> findAllByTask_IdOrderByCreatedAtAscIdAsc(
            Long taskId
    );
}