
package com.worksphere.user;

import com.worksphere.organization.Organization;
import com.worksphere.organization.OrganizationRepository;
import com.worksphere.security.DatabaseUserDetailsService;
import com.worksphere.security.JwtService;
import com.worksphere.security.WorksphereUserPrincipal;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:user-api-tenant-isolation;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "security.jwt.secret=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        "security.jwt.expiration-ms=900000"
})
@AutoConfigureMockMvc
class UserApiTenantIsolationIntegrationTest {

    private static final String ADMIN_A_EMAIL =
            "admin-a@example.com";

    private static final String EMPLOYEE_A_EMAIL =
            "employee-a@example.com";

    private static final String EMPLOYEE_B_EMAIL =
            "employee-b@example.com";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @MockitoBean
    private DatabaseUserDetailsService userDetailsService;

    private Organization organizationA;
    private Organization organizationB;
    private User employeeA;
    private User employeeB;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        organizationRepository.deleteAll();

        organizationA = organizationRepository.saveAndFlush(
                new Organization("Organization A")
        );

        organizationB = organizationRepository.saveAndFlush(
                new Organization("Organization B")
        );

        employeeA = userRepository.saveAndFlush(
                new User(
                        organizationA,
                        EMPLOYEE_A_EMAIL,
                        "test-password-hash",
                        User.Role.EMPLOYEE
                )
        );

        employeeB = userRepository.saveAndFlush(
                new User(
                        organizationB,
                        EMPLOYEE_B_EMAIL,
                        "test-password-hash",
                        User.Role.EMPLOYEE
                )
        );

        WorksphereUserPrincipal adminA =
                new WorksphereUserPrincipal(
                        100L,
                        organizationA.getId(),
                        ADMIN_A_EMAIL,
                        "test-password-hash",
                        "ORG_ADMIN",
                        true
                );

        when(userDetailsService.loadUserByUsername(ADMIN_A_EMAIL))
                .thenReturn(adminA);
    }

    @AfterEach
    void cleanUp() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void organizationAdminCanListOnlyOwnOrganizationUsers()
            throws Exception {

        String token = jwtService.generateToken(ADMIN_A_EMAIL);

        mockMvc.perform(get("/api/users")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer " + token
                        ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(employeeA.getId()))
                .andExpect(jsonPath("$[0].email")
                        .value(EMPLOYEE_A_EMAIL));
    }

    @Test
    void organizationAdminCannotGetAnotherOrganizationsUser()
            throws Exception {

        String token = jwtService.generateToken(ADMIN_A_EMAIL);

        mockMvc.perform(get("/api/users/" + employeeB.getId())
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer " + token
                        ))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"));
    }
}