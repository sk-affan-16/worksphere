package com.worksphere.onboarding;

import com.worksphere.onboarding.dto.CreateOnboardingRequest;
import com.worksphere.onboarding.dto.OnboardingResponse;
import com.worksphere.onboarding.dto.UpdateOnboardingStatusRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/onboardings")
@PreAuthorize("hasRole('ORG_ADMIN')")
public class OnboardingController {

    private final OnboardingService onboardingService;

    public OnboardingController(OnboardingService onboardingService) {
        this.onboardingService = onboardingService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OnboardingResponse createOnboarding(
            @Valid @RequestBody CreateOnboardingRequest request
    ) {
        Onboarding onboarding =
                onboardingService.createOnboarding(request.employeeId());

        return OnboardingResponse.from(onboarding);
    }

    @GetMapping
    public List<OnboardingResponse> getOnboardings() {
        return onboardingService.getOnboardings()
                .stream()
                .map(OnboardingResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public OnboardingResponse getOnboarding(@PathVariable Long id) {
        return OnboardingResponse.from(
                onboardingService.getOnboarding(id)
        );
    }

    @PatchMapping("/{id}/status")
    public OnboardingResponse updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOnboardingStatusRequest request
    ) {
        Onboarding onboarding = onboardingService.updateStatus(
                id,
                request.status()
        );

        return OnboardingResponse.from(onboarding);
    }
}
