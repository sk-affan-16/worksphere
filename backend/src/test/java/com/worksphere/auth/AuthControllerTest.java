
package com.worksphere.auth;

import com.worksphere.auth.dto.LoginRequest;
import com.worksphere.auth.dto.LoginResponse;
import com.worksphere.auth.dto.OrganizationSignupRequest;
import com.worksphere.auth.dto.OrganizationSignupResponse;
import com.worksphere.security.DatabaseUserDetailsService;
import com.worksphere.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private OrganizationSignupService organizationSignupService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private DatabaseUserDetailsService userDetailsService;

    @Test
    void validLoginRequestShouldReturnToken() throws Exception {

        when(authService.login(any(LoginRequest.class)))
                .thenReturn(new LoginResponse(
                        "test-jwt-token",
                        "Bearer"
                ));

        String request = """
                {
                    "email": "admin@example.com",
                    "password": "correct-password"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken")
                        .value("test-jwt-token"))
                .andExpect(jsonPath("$.tokenType")
                        .value("Bearer"));
    }

    @Test
    void blankEmailShouldReturnBadRequest() throws Exception {

        String request = """
                {
                    "email": "",
                    "password": "correct-password"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shortNonblankPasswordShouldPassRequestValidation()
            throws Exception {

        when(authService.login(any(LoginRequest.class)))
                .thenReturn(new LoginResponse(
                        "test-jwt-token",
                        "Bearer"
                ));

        String request = """
                {
                    "email": "admin@example.com",
                    "password": "old123"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isOk());

        verify(authService).login(any(LoginRequest.class));
    }

    @Test
    void passwordOfExactly72AsciiBytesShouldPassValidation()
            throws Exception {

        when(authService.login(any(LoginRequest.class)))
                .thenReturn(new LoginResponse(
                        "test-jwt-token",
                        "Bearer"
                ));

        String request = """
                {"email":"admin@example.com","password":"%s"}
                """.formatted("a".repeat(72));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isOk());

        verify(authService).login(any(LoginRequest.class));
    }

    @Test
    void passwordOf73AsciiBytesShouldReturnBadRequest()
            throws Exception {

        String request = """
                {"email":"admin@example.com","password":"%s"}
                """.formatted("a".repeat(73));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isBadRequest());
    }

    @Test
    void validSignupRequestShouldReturnCreated() throws Exception {

        when(organizationSignupService.signup(
                any(OrganizationSignupRequest.class)))
                .thenReturn(new OrganizationSignupResponse(
                        1L,
                        "WorkSphere Demo",
                        10L,
                        "admin@example.com",
                        "Organization registered successfully"
                ));

        String request = """
                {
                    "organizationName": "WorkSphere Demo",
                    "email": "admin@example.com",
                    "password": "StrongPassword123"
                }
                """;

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.organizationId").value(1))
                .andExpect(jsonPath("$.organizationName")
                        .value("WorkSphere Demo"))
                .andExpect(jsonPath("$.adminUserId").value(10))
                .andExpect(jsonPath("$.email")
                        .value("admin@example.com"));
    }
}
