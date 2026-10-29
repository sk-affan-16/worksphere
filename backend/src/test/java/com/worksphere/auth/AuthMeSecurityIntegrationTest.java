
package com.worksphere.auth;

import com.worksphere.security.DatabaseUserDetailsService;
import com.worksphere.security.JwtService;
import com.worksphere.security.WorksphereUserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:auth-me-security;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "security.jwt.secret=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        "security.jwt.expiration-ms=900000"
})
@AutoConfigureMockMvc
class AuthMeSecurityIntegrationTest {

    private static final String USER_EMAIL =
            "auth-me-test@example.com";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private DatabaseUserDetailsService userDetailsService;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();

        when(userDetailsService.loadUserByUsername(USER_EMAIL))
                .thenReturn(new WorksphereUserPrincipal(
                        101L,
                        10L,
                        USER_EMAIL,
                        "test-password-hash",
                        "ORG_ADMIN",
                        true
                ));
    }

    @Test
    void unauthenticatedRequestShouldReturnUnauthorized()
            throws Exception {

        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(userDetailsService);
    }

    @Test
    void authenticatedRequestShouldReturnOwnProfile()
            throws Exception {

        String token = jwtService.generateToken(USER_EMAIL);

        mockMvc.perform(get("/api/auth/me")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer " + token
                        ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(101))
                .andExpect(jsonPath("$.organizationId").value(10))
                .andExpect(jsonPath("$.email").value(USER_EMAIL))
                .andExpect(jsonPath("$.role").value("ORG_ADMIN"));

        verify(userDetailsService)
                .loadUserByUsername(USER_EMAIL);
    }

    @Test
    void clientSuppliedOrganizationIdShouldNotOverridePrincipal()
            throws Exception {

        String token = jwtService.generateToken(USER_EMAIL);

        mockMvc.perform(get("/api/auth/me")
                        .param("organizationId", "999")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer " + token
                        ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.organizationId").value(10))
                .andExpect(jsonPath("$.userId").value(101));
    }
}
