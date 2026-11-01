
package com.worksphere.employee;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import com.worksphere.organization.Organization;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import com.worksphere.organization.OrganizationRepository;
import com.worksphere.security.DatabaseUserDetailsService;
import com.worksphere.security.JwtService;
import com.worksphere.security.WorksphereUserPrincipal;
import com.worksphere.user.User;
import com.worksphere.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:employee-tenant-isolation-final;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "security.jwt.secret=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        "security.jwt.expiration-ms=900000"
})
@AutoConfigureMockMvc
class EmployeeApiTenantIsolationIntegrationTest {

    private static final String ADMIN_A_EMAIL =
            "tenant-a-admin@example.com";
    private static final String ADMIN_B_EMAIL =
            "tenant-b-admin@example.com";
    private static final String EMPLOYEE_A_EMAIL =
            "employee-a@example.com";
    private static final String EMPLOYEE_B_EMAIL =
            "employee-b@example.com";

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

    @MockitoBean
    private DatabaseUserDetailsService userDetailsService;

    private Employee employeeA;
    private Employee employeeB;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();

        // Delete dependent records before their parent records.
        employeeRepository.deleteAll();
        userRepository.deleteAll();
        organizationRepository.deleteAll();

        Organization organizationA = organizationRepository.save(
                new Organization("Tenant A")
        );
        Organization organizationB = organizationRepository.save(
                new Organization("Tenant B")
        );

        User adminA = userRepository.save(
                new User(
                        organizationA,
                        ADMIN_A_EMAIL,
                        passwordEncoder.encode("TestPassword-A-123!"),
                        User.Role.ORG_ADMIN
                )
        );
        User adminB = userRepository.save(
                new User(
                        organizationB,
                        ADMIN_B_EMAIL,
                        passwordEncoder.encode("TestPassword-B-123!"),
                        User.Role.ORG_ADMIN
                )
        );

        User employeeUserA = userRepository.save(
                new User(
                        organizationA,
                        EMPLOYEE_A_EMAIL,
                        passwordEncoder.encode("EmployeePassword-A-123!"),
                        User.Role.EMPLOYEE
                )
        );
        User employeeUserB = userRepository.save(
                new User(
                        organizationB,
                        EMPLOYEE_B_EMAIL,
                        passwordEncoder.encode("EmployeePassword-B-123!"),
                        User.Role.EMPLOYEE
                )
        );

        employeeA = employeeRepository.save(
                new Employee(
                        employeeUserA,
                        "Alice",
                        "TenantA",
                        "1111111111",
                        "Developer",
                        "Engineering",
                        LocalDate.of(2025, 1, 10)
                )
        );
        employeeB = employeeRepository.save(
                new Employee(
                        employeeUserB,
                        "Bob",
                        "TenantB",
                        "2222222222",
                        "Analyst",
                        "Finance",
                        LocalDate.of(2025, 2, 10)
                )
        );

        when(userDetailsService.loadUserByUsername(anyString()))
                .thenAnswer(invocation -> {
                    String email = invocation.getArgument(0);

                    if (ADMIN_A_EMAIL.equals(email)) {
                        return new WorksphereUserPrincipal(
                                adminA.getId(),
                                organizationA.getId(),
                                ADMIN_A_EMAIL,
                                adminA.getPasswordHash(),
                                "ORG_ADMIN",
                                true
                        );
                    }

                    if (ADMIN_B_EMAIL.equals(email)) {
                        return new WorksphereUserPrincipal(
                                adminB.getId(),
                                organizationB.getId(),
                                ADMIN_B_EMAIL,
                                adminB.getPasswordHash(),
                                "ORG_ADMIN",
                                true
                        );
                    }

                    throw new UsernameNotFoundException("User not found");
                });
    }

    @Test
    void organizationAdminListsOnlyOwnEmployees() throws Exception {
        mockMvc.perform(
                        get("/api/employees")
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        bearerToken(ADMIN_A_EMAIL)
                                )
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].firstName")
                        .value(org.hamcrest.Matchers.hasItem("Alice")))
                .andExpect(jsonPath("$[*].firstName")
                        .value(org.hamcrest.Matchers.not(
                                org.hamcrest.Matchers.hasItem("Bob")
                        )));
    }

    @Test
    void organizationAdminCannotReadAnotherTenantsEmployee()
            throws Exception {
        mockMvc.perform(
                        get("/api/employees/{id}", employeeB.getId())
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        bearerToken(ADMIN_A_EMAIL)
                                )
                )
                .andExpect(status().isNotFound());
    }

    @Test
    void organizationAdminCannotUpdateAnotherTenantsEmployee()
            throws Exception {
        Long employeeBId = employeeB.getId();

        mockMvc.perform(
                        patch("/api/employees/{id}", employeeBId)
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        bearerToken(ADMIN_A_EMAIL)
                                )
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                          "firstName": "Hacked",
                                          "lastName": "Employee",
                                          "phone": "9999999999",
                                          "jobTitle": "Administrator",
                                          "department": "IT",
                                          "hireDate": "2026-01-01"
                                        }
                                        """)
                )
                .andExpect(status().isNotFound());

        Employee unchanged =
                employeeRepository.findById(employeeBId).orElseThrow();

        assertEquals("Bob", unchanged.getFirstName());
        assertEquals("TenantB", unchanged.getLastName());
        assertEquals("Analyst", unchanged.getJobTitle());
        assertEquals("Finance", unchanged.getDepartment());
    }

    @Test
    void organizationAdminCannotChangeAnotherTenantsEmployeeStatus()
            throws Exception {
        Long employeeBId = employeeB.getId();

        mockMvc.perform(
                        patch("/api/employees/{id}/status", employeeBId)
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        bearerToken(ADMIN_A_EMAIL)
                                )
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                          "status": "DISABLED"
                                        }
                                        """)
                )
                .andExpect(status().isNotFound());

        User unchangedUser = userRepository.findAll().stream()
                .filter(user -> EMPLOYEE_B_EMAIL.equals(user.getEmail()))
                .findFirst()
                .orElseThrow();

        assertEquals(User.Status.ACTIVE, unchangedUser.getStatus());
    }

    @Test
    void organizationBAdminCanReadOwnEmployee() throws Exception {

        mockMvc.perform(
                        get("/api/employees/{id}", employeeB.getId())
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        bearerToken(ADMIN_B_EMAIL)
                                )
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Bob"));
    }
    @Test
    void organizationAdminCreatesEmployeeOnlyInsideOwnTenant()
            throws Exception {

        mockMvc.perform(
                        post("/api/employees")
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        bearerToken(ADMIN_A_EMAIL)
                                )
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                    {
                                      "firstName": "Charlie",
                                      "lastName": "TenantA",
                                      "email": "charlie@example.com",
                                      "password": "StrongPassword-123!",
                                      "phone": "9999999999",
                                      "jobTitle": "Developer",
                                      "department": "Engineering",
                                      "hireDate": "2026-10-30"
                                    }
                                    """)
                )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.firstName").value("Charlie"));

        mockMvc.perform(
                        get("/api/employees")
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        bearerToken(ADMIN_A_EMAIL)
                                )
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].firstName")
                        .value(org.hamcrest.Matchers.hasItem("Charlie")));

        mockMvc.perform(
                        get("/api/employees")
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        bearerToken(ADMIN_B_EMAIL)
                                )
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].firstName")
                        .value(org.hamcrest.Matchers.not(
                                org.hamcrest.Matchers.hasItem("Charlie")
                        )));
    }
    @Test
    void organizationBAdminCannotReadAnotherTenantsEmployee()
            throws Exception {

        Long employeeAId = employeeA.getId();

        // Tenant A can access its own employee.
        mockMvc.perform(
                        get("/api/employees/{id}", employeeAId)
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        bearerToken(ADMIN_A_EMAIL)
                                )
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Alice"));

        // Tenant B cannot access Tenant A's employee.
        mockMvc.perform(
                        get("/api/employees/{id}", employeeAId)
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        bearerToken(ADMIN_B_EMAIL)
                                )
                )
                .andExpect(status().isNotFound());
    }
    private String bearerToken(String email) {
        return "Bearer " + jwtService.generateToken(email);
    }
}
