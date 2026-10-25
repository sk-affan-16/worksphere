
package com.worksphere.organization;

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
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:organization-api-security;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "security.jwt.secret=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        "security.jwt.expiration-ms=900000"
})
@AutoConfigureMockMvc
class OrganizationApiSecurityIntegrationTest {

    private static final String EMPLOYEE_EMAIL =
            "employee-org@example.com";

    private static final String ADMIN_EMAIL =
            "admin-org@example.com";

    private static final String SECOND_ADMIN_EMAIL =
            "admin-second-org@example.com";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private OrganizationRepository organizationRepository;

    @MockitoBean
    private DatabaseUserDetailsService userDetailsService;

    private Organization organization;
    private Organization secondOrganization;

    @BeforeEach
    void setUp() {
        organizationRepository.deleteAll();

        organization = organizationRepository.save(
                new Organization("Original Organization")
        );

        secondOrganization = organizationRepository.save(
                new Organization("Second Organization")
        );

        when(userDetailsService.loadUserByUsername(EMPLOYEE_EMAIL))
                .thenReturn(new WorksphereUserPrincipal(
                        1L,
                        organization.getId(),
                        EMPLOYEE_EMAIL,
                        "test-password-hash",
                        "EMPLOYEE",
                        true
                ));

        when(userDetailsService.loadUserByUsername(ADMIN_EMAIL))
                .thenReturn(new WorksphereUserPrincipal(
                        2L,
                        organization.getId(),
                        ADMIN_EMAIL,
                        "test-password-hash",
                        "ORG_ADMIN",
                        true
                ));

        when(userDetailsService.loadUserByUsername(SECOND_ADMIN_EMAIL))
                .thenReturn(new WorksphereUserPrincipal(
                        3L,
                        secondOrganization.getId(),
                        SECOND_ADMIN_EMAIL,
                        "test-password-hash",
                        "ORG_ADMIN",
                        true
                ));
    }

    @AfterEach
    void cleanUp() {
        organizationRepository.deleteAll();
        SecurityContextHolder.clearContext();
    }

    @Test
    void updateOrganizationWithoutTokenReturnsUnauthorized()
            throws Exception {

        mockMvc.perform(patch("/api/organizations/me")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Updated Organization"}
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void employeeCannotUpdateOrganization()
            throws Exception {

        String token = jwtService.generateToken(EMPLOYEE_EMAIL);

        mockMvc.perform(patch("/api/organizations/me")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer " + token
                        )
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Unauthorized Change"}
                                """))
                .andExpect(status().isForbidden());

        Organization unchanged = organizationRepository
                .findById(organization.getId())
                .orElseThrow();

        assertEquals(
                "Original Organization",
                unchanged.getName()
        );
    }

    @Test
    void organizationAdminCanUpdateOrganization()
            throws Exception {

        String token = jwtService.generateToken(ADMIN_EMAIL);

        mockMvc.perform(patch("/api/organizations/me")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer " + token
                        )
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Updated Organization"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name")
                        .value("Updated Organization"));

        Organization updated = organizationRepository
                .findById(organization.getId())
                .orElseThrow();

        assertEquals(
                "Updated Organization",
                updated.getName()
        );
    }

    @Test
    void organizationAdminCanOnlyReadOwnOrganization()
            throws Exception {

        String firstOrganizationToken =
                jwtService.generateToken(ADMIN_EMAIL);

        mockMvc.perform(get("/api/organizations/me")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer " + firstOrganizationToken
                        ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name")
                        .value("Original Organization"));

        String secondOrganizationToken =
                jwtService.generateToken(SECOND_ADMIN_EMAIL);

        mockMvc.perform(get("/api/organizations/me")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer " + secondOrganizationToken
                        ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name")
                        .value("Second Organization"));
    }

    @Test
    void updatingOneOrganizationDoesNotChangeAnotherOrganization()
            throws Exception {

        String firstOrganizationToken =
                jwtService.generateToken(ADMIN_EMAIL);

        mockMvc.perform(patch("/api/organizations/me")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer " + firstOrganizationToken
                        )
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"First Organization Updated"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name")
                        .value("First Organization Updated"));

        Organization secondUnchanged = organizationRepository
                .findById(secondOrganization.getId())
                .orElseThrow();

        assertEquals(
                "Second Organization",
                secondUnchanged.getName()
        );
    }
}
