
package com.worksphere.onboarding.dto;

import com.worksphere.onboarding.Onboarding;
import jakarta.validation.constraints.NotNull;

public record UpdateOnboardingStatusRequest(
        @NotNull(message = "Onboarding status is required")
        Onboarding.Status status
) {
}
