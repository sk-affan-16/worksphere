
package com.worksphere.onboarding.dto;

import com.worksphere.onboarding.Onboarding;

import java.time.Instant;

public record OnboardingResponse(
        Long id,
        Long employeeId,
        String employeeName,
        String employeeEmail,
        Onboarding.Status status,
        Instant createdAt,
        Instant completedAt
) {
    public static OnboardingResponse from(Onboarding onboarding) {
        var employee = onboarding.getEmployee();

        return new OnboardingResponse(
                onboarding.getId(),
                employee.getId(),
                employee.getFirstName() + " " + employee.getLastName(),
                employee.getUser().getEmail(),
                onboarding.getStatus(),
                onboarding.getCreatedAt(),
                onboarding.getCompletedAt()
        );
    }
}
