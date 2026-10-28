package com.worksphere.onboarding;

import com.worksphere.employee.Employee;
import com.worksphere.employee.EmployeeRepository;
import com.worksphere.organization.Organization;
import com.worksphere.organization.OrganizationRepository;
import com.worksphere.user.User;
import com.worksphere.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
class OnboardingRepositoryTenantIsolationTest {

    @Autowired
    private OnboardingRepository onboardingRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    private Organization organizationA;
    private Organization organizationB;
    private Onboarding onboardingA;
    private Onboarding onboardingB;

    @BeforeEach
    void setUp() {
        onboardingRepository.deleteAll();
        employeeRepository.deleteAll();
        userRepository.deleteAll();
        organizationRepository.deleteAll();

        organizationA = organizationRepository.saveAndFlush(
                new Organization("Organization A")
        );

        organizationB = organizationRepository.saveAndFlush(
                new Organization("Organization B")
        );

        User userA = userRepository.saveAndFlush(
                new User(
                        organizationA,
                        "onboarding-a@example.com",
                        "test-password-hash",
                        User.Role.EMPLOYEE
                )
        );

        User userB = userRepository.saveAndFlush(
                new User(
                        organizationB,
                        "onboarding-b@example.com",
                        "test-password-hash",
                        User.Role.EMPLOYEE
                )
        );

        Employee employeeA = employeeRepository.saveAndFlush(
                new Employee(
                        userA,
                        "Employee",
                        "Alpha",
                        null,
                        null,
                        null,
                        null
                )
        );

        Employee employeeB = employeeRepository.saveAndFlush(
                new Employee(
                        userB,
                        "Employee",
                        "Beta",
                        null,
                        null,
                        null,
                        null
                )
        );

        onboardingA = onboardingRepository.saveAndFlush(
                new Onboarding(employeeA)
        );

        onboardingB = onboardingRepository.saveAndFlush(
                new Onboarding(employeeB)
        );
    }

    @Test
    void organizationAQueryReturnsOnlyItsOwnOnboardingRecords() {
        List<Onboarding> results =
                onboardingRepository
                        .findAllByEmployee_User_Organization_Id(
                                organizationA.getId()
                        );

        assertEquals(1, results.size());
        assertEquals(onboardingA.getId(), results.get(0).getId());
        assertEquals(
                organizationA.getId(),
                results.get(0).getEmployee()
                        .getUser().getOrganization().getId()
        );
    }

    @Test
    void organizationBQueryReturnsOnlyItsOwnOnboardingRecords() {
        List<Onboarding> results =
                onboardingRepository
                        .findAllByEmployee_User_Organization_Id(
                                organizationB.getId()
                        );

        assertEquals(1, results.size());
        assertEquals(onboardingB.getId(), results.get(0).getId());
    }

    @Test
    void organizationACannotFindOrganizationBOnboarding() {
        Optional<Onboarding> result =
                onboardingRepository
                        .findByIdAndEmployee_User_Organization_Id(
                                onboardingB.getId(),
                                organizationA.getId()
                        );

        assertFalse(result.isPresent());
    }

    @Test
    void organizationBCanFindItsOwnOnboarding() {
        Optional<Onboarding> result =
                onboardingRepository
                        .findByIdAndEmployee_User_Organization_Id(
                                onboardingB.getId(),
                                organizationB.getId()
                        );

        assertTrue(result.isPresent());
        assertEquals(onboardingB.getId(), result.get().getId());
    }
}
