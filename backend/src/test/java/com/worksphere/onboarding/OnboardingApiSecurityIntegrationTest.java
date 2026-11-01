
package com.worksphere.onboarding;

import com.worksphere.employee.Employee;
import com.worksphere.employee.EmployeeRepository;
import com.worksphere.organization.Organization;
import com.worksphere.organization.OrganizationRepository;
import com.worksphere.security.DatabaseUserDetailsService;
import com.worksphere.security.JwtService;
import com.worksphere.security.WorksphereUserPrincipal;
import com.worksphere.user.User;
import com.worksphere.user.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:onboarding-api-security;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "security.jwt.secret=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        "security.jwt.expiration-ms=900000"
})
@AutoConfigureMockMvc
class OnboardingApiSecurityIntegrationTest {

    private static final String ADMIN_A_EMAIL = "admin-a@test.com";
    private static final String ADMIN_B_EMAIL = "admin-b@test.com";
    private static final String EMPLOYEE_EMAIL = "employee@test.com";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private OnboardingRepository onboardingRepository;

    @MockitoBean
    private DatabaseUserDetailsService userDetailsService;

    private Onboarding onboardingA;
    private Onboarding onboardingB;
    private Employee employeeB;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();

        onboardingRepository.deleteAll();
        employeeRepository.deleteAll();
        userRepository.deleteAll();
        organizationRepository.deleteAll();

        Organization organizationA = organizationRepository.saveAndFlush(
                new Organization("Tenant A")
        );

        Organization organizationB = organizationRepository.saveAndFlush(
                new Organization("Tenant B")
        );

        User userA = userRepository.saveAndFlush(
                new User(
                        organizationA,
                        EMPLOYEE_EMAIL,
                        "test-password-hash",
                        User.Role.EMPLOYEE
                )
        );

        User userB = userRepository.saveAndFlush(
                new User(
                        organizationB,
                        "employee-b@test.com",
                        "test-password-hash",
                        User.Role.EMPLOYEE
                )
        );

        Employee employeeA = employeeRepository.saveAndFlush(
                new Employee(
                        userA, "Alice", "TenantA",
                        null, null, null, null
                )
        );

        employeeB = employeeRepository.saveAndFlush(
                new Employee(
                        userB, "Bob", "TenantB",
                        null, null, null, null
                )
        );

        onboardingA = onboardingRepository.saveAndFlush(
                new Onboarding(employeeA)
        );

        onboardingB = onboardingRepository.saveAndFlush(
                new Onboarding(employeeB)
        );

        when(userDetailsService.loadUserByUsername(ADMIN_A_EMAIL))
                .thenReturn(new WorksphereUserPrincipal(
                        101L, organizationA.getId(),
                        ADMIN_A_EMAIL, "test-password-hash",
                        "ORG_ADMIN", true
                ));

        when(userDetailsService.loadUserByUsername(ADMIN_B_EMAIL))
                .thenReturn(new WorksphereUserPrincipal(
                        102L, organizationB.getId(),
                        ADMIN_B_EMAIL, "test-password-hash",
                        "ORG_ADMIN", true
                ));

        when(userDetailsService.loadUserByUsername(EMPLOYEE_EMAIL))
                .thenReturn(new WorksphereUserPrincipal(
                        userA.getId(), organizationA.getId(),
                        EMPLOYEE_EMAIL, "test-password-hash",
                        "EMPLOYEE", true
                ));
    }

    @AfterEach
    void cleanUp() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void unauthenticatedRequestShouldReturnUnauthorized()
            throws Exception {

        mockMvc.perform(get("/api/onboardings"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void invalidTokenShouldReturnUnauthorized()
            throws Exception {

        mockMvc.perform(get("/api/onboardings")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer invalid-token"
                        ))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void employeeShouldNotAccessOnboarding()
            throws Exception {

        mockMvc.perform(get("/api/onboardings")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                bearerToken(EMPLOYEE_EMAIL)
                        ))
                .andExpect(status().isForbidden());
    }

    @Test
    void organizationAdminCannotReadAnotherTenantsOnboarding()
            throws Exception {

        mockMvc.perform(get(
                        "/api/onboardings/{id}",
                        onboardingB.getId()
                )
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                bearerToken(ADMIN_A_EMAIL)
                        ))
                .andExpect(status().isNotFound());
    }

    @Test
    void organizationAdminCannotCreateOnboardingForAnotherTenantEmployee()
            throws Exception {

        mockMvc.perform(post("/api/onboardings")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                bearerToken(ADMIN_A_EMAIL)
                        )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "employeeId": %d
                                }
                                """.formatted(employeeB.getId())))
                .andExpect(status().isNotFound());
    }

    @Test
    void organizationAdminCanReadOwnOnboarding()
            throws Exception {

        mockMvc.perform(get(
                        "/api/onboardings/{id}",
                        onboardingA.getId()
                )
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                bearerToken(ADMIN_A_EMAIL)
                        ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id")
                        .value(onboardingA.getId()))
                .andExpect(jsonPath("$.employeeName")
                        .value("Alice TenantA"));
    }

    private String bearerToken(String email) {
        return "Bearer " + jwtService.generateToken(email);
    }
}
