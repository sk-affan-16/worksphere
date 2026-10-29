
package com.worksphere.onboarding;

import com.worksphere.employee.Employee;
import com.worksphere.employee.EmployeeRepository;
import com.worksphere.security.CurrentTenantService;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class OnboardingService {

    private final OnboardingRepository onboardingRepository;
    private final EmployeeRepository employeeRepository;
    private final CurrentTenantService currentTenantService;

    public OnboardingService(
            OnboardingRepository onboardingRepository,
            EmployeeRepository employeeRepository,
            CurrentTenantService currentTenantService
    ) {
        this.onboardingRepository = onboardingRepository;
        this.employeeRepository = employeeRepository;
        this.currentTenantService = currentTenantService;
    }

    @Transactional
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public Onboarding createOnboarding(Long employeeId) {
        if (employeeId == null || employeeId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Employee ID must be a positive number"
            );
        }

        Long organizationId =
                currentTenantService.getCurrentOrganizationId();

        Employee employee = employeeRepository
                .findByIdAndUser_Organization_Id(
                        employeeId,
                        organizationId
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found"
                ));

        if (onboardingRepository.existsByEmployee_Id(employeeId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Onboarding already exists for this employee"
            );
        }

        return onboardingRepository.save(new Onboarding(employee));
    }

    @Transactional
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public List<Onboarding> getOnboardings() {
        Long organizationId =
                currentTenantService.getCurrentOrganizationId();

        return onboardingRepository
                .findAllByEmployee_User_Organization_Id(organizationId);
    }

    @Transactional
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public Onboarding getOnboarding(Long onboardingId) {
        return findOnboardingInOrganization(onboardingId);
    }

    @Transactional
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public Onboarding updateStatus(
            Long onboardingId,
            Onboarding.Status status
    ) {
        if (status == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Onboarding status is required"
            );
        }

        Onboarding onboarding =
                findOnboardingInOrganization(onboardingId);

        onboarding.updateStatus(status);

        return onboardingRepository.save(onboarding);
    }

    private Onboarding findOnboardingInOrganization(Long onboardingId) {
        if (onboardingId == null || onboardingId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Onboarding ID must be a positive number"
            );
        }

        Long organizationId =
                currentTenantService.getCurrentOrganizationId();

        return onboardingRepository
                .findByIdAndEmployee_User_Organization_Id(
                        onboardingId,
                        organizationId
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Onboarding not found"
                ));
    }
}
