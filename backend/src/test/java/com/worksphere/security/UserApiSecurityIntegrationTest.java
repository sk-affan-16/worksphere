
package com.worksphere.security;

import com.worksphere.user.User;
import com.worksphere.user.UserService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.Date;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:user-api-security;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "security.jwt.secret=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        "security.jwt.expiration-ms=900000"
})
@AutoConfigureMockMvc
class UserApiSecurityIntegrationTest {

    private static final String TEST_EMAIL = "employee@example.com";

    private static final String TEST_SECRET =
            "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private DatabaseUserDetailsService userDetailsService;

    @MockitoBean
    private UserService userService;

    @BeforeEach
    void setUp() {
        WorksphereUserPrincipal principal =
                new WorksphereUserPrincipal(
                        1L,
                        10L,
                        TEST_EMAIL,
                        "test-password-hash",
                        "EMPLOYEE",
                        true
                );

        when(userDetailsService.loadUserByUsername(TEST_EMAIL))
                .thenReturn(principal);

        when(userService.getAllUsers()).thenReturn(List.of());

        User testUser = createUser(25L, TEST_EMAIL);

        when(userService.getUserById(25L)).thenReturn(testUser);
    }

    @AfterEach
    void clearSecurityContext() {
        org.springframework.security.core.context.SecurityContextHolder
                .clearContext();
    }

    @Test
    void getAllUsersWithoutTokenReturnsUnauthorized()
            throws Exception {

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(userService);
        verifyNoInteractions(userDetailsService);
    }

    @Test
    void getUserByIdWithoutTokenReturnsUnauthorized()
            throws Exception {

        mockMvc.perform(get("/api/users/25"))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(userService);
        verifyNoInteractions(userDetailsService);
    }

    @Test
    void getAllUsersWithInvalidTokenReturnsUnauthorized()
            throws Exception {

        mockMvc.perform(get("/api/users")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer invalid-token"
                        ))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(userService);
        verifyNoInteractions(userDetailsService);
    }

    @Test
    void getUserByIdWithInvalidTokenReturnsUnauthorized()
            throws Exception {

        mockMvc.perform(get("/api/users/25")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer invalid-token"
                        ))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(userService);
        verifyNoInteractions(userDetailsService);
    }

    @Test
    void getAllUsersWithExpiredTokenReturnsUnauthorized()
            throws Exception {

        mockMvc.perform(get("/api/users")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer " + createExpiredToken()
                        ))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(userService);
        verifyNoInteractions(userDetailsService);
    }

    @Test
    void getUserByIdWithExpiredTokenReturnsUnauthorized()
            throws Exception {

        mockMvc.perform(get("/api/users/25")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer " + createExpiredToken()
                        ))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(userService);
        verifyNoInteractions(userDetailsService);
    }

    @Test
    void getAllUsersWithValidTokenReturnsSuccess()
            throws Exception {

        String token = jwtService.generateToken(TEST_EMAIL);

        mockMvc.perform(get("/api/users")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer " + token
                        ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        verify(userDetailsService).loadUserByUsername(TEST_EMAIL);
        verify(userService).getAllUsers();
    }

    @Test
    void getUserByIdWithValidTokenReturnsUser()
            throws Exception {

        String token = jwtService.generateToken(TEST_EMAIL);

        mockMvc.perform(get("/api/users/25")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer " + token
                        ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(25))
                .andExpect(jsonPath("$.email").value(TEST_EMAIL))
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.organization").doesNotExist());

        verify(userDetailsService).loadUserByUsername(TEST_EMAIL);
        verify(userService).getUserById(25L);
    }

    private String createExpiredToken() {
        Instant now = Instant.now();

        return Jwts.builder()
                .subject(TEST_EMAIL)
                .issuedAt(Date.from(now.minusSeconds(120)))
                .expiration(Date.from(now.minusSeconds(60)))
                .signWith(
                        Keys.hmacShaKeyFor(
                                Decoders.BASE64.decode(TEST_SECRET)
                        )
                )
                .compact();
    }

    private User createUser(Long id, String email) {
        User user = org.mockito.Mockito.mock(User.class);

        when(user.getId()).thenReturn(id);
        when(user.getEmail()).thenReturn(email);
        when(user.getRole()).thenReturn(User.Role.EMPLOYEE);
        when(user.getStatus()).thenReturn(User.Status.ACTIVE);
        when(user.getCreatedAt())
                .thenReturn(Instant.parse("2026-10-24T10:00:00Z"));

        return user;
    }
}
