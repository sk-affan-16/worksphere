
package com.worksphere.auth;

import com.worksphere.auth.dto.LoginRequest;
import com.worksphere.auth.dto.LoginResponse;
import com.worksphere.auth.dto.OrganizationRegisterRequest;
import com.worksphere.auth.dto.OrganizationSignupRequest;
import com.worksphere.auth.dto.OrganizationSignupResponse;
import com.worksphere.security.DatabaseUserDetailsService;
import com.worksphere.security.JwtService;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
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


    @Test
    void validMultipartRegistrationShouldReturnCreated()
            throws Exception {

        when(organizationSignupService.register(
                any(OrganizationRegisterRequest.class)))
                .thenReturn(new OrganizationSignupResponse(
                        1L,
                        "WorkSphere Technologies",
                        10L,
                        "admin@example.com",
                        "Organization registered successfully"
                ));

        // Valid PNG signature bytes
        byte[] pngBytes = new byte[]{
                (byte) 0x89,
                0x50,
                0x4E,
                0x47,
                0x0D,
                0x0A,
                0x1A,
                0x0A
        };

        MockMultipartFile profilePhoto =
                new MockMultipartFile(
                        "profilePhoto",
                        "profile.png",
                        "image/png",
                        pngBytes
                );

        mockMvc.perform(multipart("/api/auth/register")
                        .file(profilePhoto)
                        .param("organizationName", "WorkSphere Technologies")
                        .param("firstName", "Affan")
                        .param("lastName", "Raja")
                        .param("email", "admin@example.com")
                        .param("jobTitle", "Administrator")
                        .param("department", "Management")
                        .param("phone", "9876543210")
                        .param("password", "StrongPassword123"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.organizationId").value(1))
                .andExpect(jsonPath("$.organizationName")
                        .value("WorkSphere Technologies"))
                .andExpect(jsonPath("$.adminUserId").value(10))
                .andExpect(jsonPath("$.email")
                        .value("admin@example.com"));

        verify(organizationSignupService)
                .register(any(OrganizationRegisterRequest.class));
    }

}
