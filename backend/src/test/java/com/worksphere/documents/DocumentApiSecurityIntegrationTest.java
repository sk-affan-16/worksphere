
package com.worksphere.documents;

import com.worksphere.employee.Employee;
import com.worksphere.employee.EmployeeRepository;
import com.worksphere.organization.Organization;
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

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:document-api-security;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "security.jwt.secret=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        "security.jwt.expiration-ms=900000"
})
@AutoConfigureMockMvc
class DocumentApiSecurityIntegrationTest {

    private static final String ADMIN_A_EMAIL =
            "document-admin-a@example.com";

    private static final String ADMIN_B_EMAIL =
            "document-admin-b@example.com";

    private static final String EMPLOYEE_EMAIL =
            "document-employee@example.com";

    private static final byte[] PDF_BYTES = {
            0x25, 0x50, 0x44, 0x46, 0x2D,
            0x31, 0x2E, 0x37
    };

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
    private DocumentRepository documentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private DatabaseUserDetailsService userDetailsService;

    @MockitoBean
    private DocumentStorageService documentStorageService;

    private Document documentA;
    private Document documentB;

    @BeforeEach
    void setUp() {

        SecurityContextHolder.clearContext();

        documentRepository.deleteAll();
        employeeRepository.deleteAll();
        userRepository.deleteAll();
        organizationRepository.deleteAll();

        Organization organizationA = organizationRepository.save(
                new Organization("Document Tenant A")
        );

        Organization organizationB = organizationRepository.save(
                new Organization("Document Tenant B")
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

        User employeeUser = userRepository.save(
                new User(
                        organizationA,
                        EMPLOYEE_EMAIL,
                        passwordEncoder.encode("EmployeePassword-123!"),
                        User.Role.EMPLOYEE
                )
        );

        Employee employeeA = employeeRepository.save(
                new Employee(
                        employeeUser,
                        "Alice",
                        "TenantA",
                        "1111111111",
                        "Developer",
                        "Engineering",
                        LocalDate.of(2025, 1, 10)
                )
        );

        User employeeUserB = userRepository.save(
                new User(
                        organizationB,
                        "employee-b-document@example.com",
                        passwordEncoder.encode("EmployeePassword-B-123!"),
                        User.Role.EMPLOYEE
                )
        );

        Employee employeeB = employeeRepository.save(
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

        documentA = documentRepository.save(
                new Document(
                        employeeA,
                        "Employment Contract",
                        "CONTRACT",
                        "contract-a.pdf",
                        "11111111-1111-1111-1111-111111111111.pdf",
                        "application/pdf",
                        (long) PDF_BYTES.length
                )
        );

        documentB = documentRepository.save(
                new Document(
                        employeeB,
                        "Employment Contract",
                        "CONTRACT",
                        "contract-b.pdf",
                        "22222222-2222-2222-2222-222222222222.pdf",
                        "application/pdf",
                        (long) PDF_BYTES.length
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

                    if (EMPLOYEE_EMAIL.equals(email)) {
                        return new WorksphereUserPrincipal(
                                employeeUser.getId(),
                                organizationA.getId(),
                                EMPLOYEE_EMAIL,
                                employeeUser.getPasswordHash(),
                                "EMPLOYEE",
                                true
                        );
                    }

                    throw new UsernameNotFoundException("User not found");
                });
    }

    @Test
    void downloadWithoutAuthenticationShouldReturnUnauthorized()
            throws Exception {

        mockMvc.perform(
                        get("/api/documents/{id}/download", documentA.getId())
                )
                .andExpect(status().isUnauthorized());
    }

    @Test
    void employeeShouldNotDownloadDocument()
            throws Exception {

        mockMvc.perform(
                        get("/api/documents/{id}/download", documentA.getId())
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        bearerToken(EMPLOYEE_EMAIL)
                                )
                )
                .andExpect(status().isForbidden());
    }

    @Test
    void organizationAdminShouldDownloadOwnTenantDocument()
            throws Exception {

        when(documentStorageService.load(
                "11111111-1111-1111-1111-111111111111.pdf"
        )).thenReturn(PDF_BYTES);

        mockMvc.perform(
                        get("/api/documents/{id}/download", documentA.getId())
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        bearerToken(ADMIN_A_EMAIL)
                                )
                )
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(content().bytes(PDF_BYTES))
                .andExpect(header().string(
                        HttpHeaders.CONTENT_DISPOSITION,
                        org.hamcrest.Matchers.containsString(
                                "attachment; filename=\"contract-a.pdf\""
                        )
                ));
    }

    @Test
    void organizationAdminShouldNotDownloadAnotherTenantsDocument()
            throws Exception {

        mockMvc.perform(
                        get("/api/documents/{id}/download", documentB.getId())
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        bearerToken(ADMIN_A_EMAIL)
                                )
                )
                .andExpect(status().isNotFound());
    }

    @Test
    void downloadingNonexistentDocumentShouldReturnNotFound()
            throws Exception {

        mockMvc.perform(
                        get("/api/documents/{id}/download", 999999L)
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        bearerToken(ADMIN_A_EMAIL)
                                )
                )
                .andExpect(status().isNotFound());
    }

    private String bearerToken(String email) {
        return "Bearer " + jwtService.generateToken(email);
    }
}
