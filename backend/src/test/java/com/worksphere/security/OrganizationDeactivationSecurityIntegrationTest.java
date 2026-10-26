
package com.worksphere.security;

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
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:organization-deactivation-security;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "security.jwt.secret=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        "security.jwt.expiration-ms=900000"
})
@AutoConfigureMockMvc
class OrganizationDeactivationSecurityIntegrationTest {

    private static final String USER_EMAIL =
            "organization-deactivation@example.com";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    private Organization organization;
    private User user;
    private String existingToken;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        organizationRepository.deleteAll();

        organization = organizationRepository.saveAndFlush(
                new Organization("Organization Deactivation Test")
        );

        user = userRepository.saveAndFlush(
                new User(
                        organization,
                        USER_EMAIL,
                        "test-password-hash",
                        User.Role.ORG_ADMIN
                )
        );

        existingToken = jwtService.generateToken(user.getEmail());
    }

    @AfterEach
    void cleanUp() {
        userRepository.deleteAll();
        organizationRepository.deleteAll();

        org.springframework.security.core.context.SecurityContextHolder
                .clearContext();
    }

    @Test
    void existingJwtIsRejectedAfterOrganizationBecomesInactive()
            throws Exception {

        organization.setStatus(Organization.Status.INACTIVE);
        organizationRepository.saveAndFlush(organization);

        Organization persistedOrganization =
                organizationRepository.findById(organization.getId())
                        .orElseThrow();

        assertEquals(
                Organization.Status.INACTIVE,
                persistedOrganization.getStatus()
        );

        mockMvc.perform(get("/api/organizations/me")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer " + existingToken
                        ))
                .andExpect(status().isUnauthorized());
    }
}
