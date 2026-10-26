package com.worksphere.security;

import com.worksphere.employee.Employee;
import com.worksphere.employee.EmployeeRepository;
import com.worksphere.organization.Organization;
import com.worksphere.organization.OrganizationRepository;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:account-deactivation-security;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "security.jwt.secret=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        "security.jwt.expiration-ms=900000"
})
@AutoConfigureMockMvc
class AccountDeactivationSecurityIntegrationTest {

    private static final String ADMIN_EMAIL =
            "deactivation-admin@example.com";
    private static final String EMPLOYEE_EMAIL =
            "deactivation-employee@example.com";
    private static final String PASSWORD =
            "TestPassword-123!";

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
    private PasswordEncoder passwordEncoder;

    private User admin;
    private User employeeUser;
    private Employee employee;

    @BeforeEach
    void setUp() {
        employeeRepository.deleteAll();
        userRepository.deleteAll();
        organizationRepository.deleteAll();

        Organization organization = organizationRepository.saveAndFlush(
                new Organization("Deactivation Test Organization")
        );

        admin = userRepository.saveAndFlush(
                new User(
                        organization,
                        ADMIN_EMAIL,
                        passwordEncoder.encode(PASSWORD),
                        User.Role.ORG_ADMIN
                )
        );

        employeeUser = userRepository.saveAndFlush(
                new User(
                        organization,
                        EMPLOYEE_EMAIL,
                        passwordEncoder.encode(PASSWORD),
                        User.Role.EMPLOYEE
                )
        );

        employee = employeeRepository.saveAndFlush(
                new Employee(
                        employeeUser,
                        "Test",
                        "Employee",
                        null,
                        "Developer",
                        "Engineering",
                        LocalDate.of(2026, 1, 1)
                )
        );
    }

    @AfterEach
    void cleanUp() {
        employeeRepository.deleteAll();
        userRepository.deleteAll();
        organizationRepository.deleteAll();

        org.springframework.security.core.context.SecurityContextHolder
                .clearContext();
    }

    @Test
    void disabledUserCannotLoginOrReceiveNewJwt() throws Exception {
        employeeUser.setStatus(User.Status.DISABLED);
        userRepository.saveAndFlush(employeeUser);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "deactivation-employee@example.com",
                                  "password": "TestPassword-123!"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code")
                        .value("INVALID_CREDENTIALS"))
                .andExpect(content().string(
                        not(containsString("accessToken"))));
    }

    @Test
    void previouslyIssuedJwtIsRejectedAfterEmployeeDeactivation()
            throws Exception {
        String employeeToken =
                jwtService.generateToken(employeeUser.getEmail());
        String adminToken =
                jwtService.generateToken(admin.getEmail());

        mockMvc.perform(patch(
                        "/api/employees/{id}/status",
                        employee.getId())
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer " + adminToken
                        )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "status": "DISABLED"
                                }
                                """))
                .andExpect(status().isNoContent());

        User persistedEmployee = userRepository
                .findById(employeeUser.getId())
                .orElseThrow();

        org.junit.jupiter.api.Assertions.assertEquals(
                User.Status.DISABLED,
                persistedEmployee.getStatus()
        );

        mockMvc.perform(get("/api/users")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer " + employeeToken
                        ))
                .andExpect(status().isUnauthorized());
    }
}
