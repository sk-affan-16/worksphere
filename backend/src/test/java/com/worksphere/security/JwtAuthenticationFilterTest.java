package com.worksphere.security;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtAuthenticationFilterTest {

    private JwtService jwtService;
    private DatabaseUserDetailsService userDetailsService;
    private JwtAuthenticationFilter filter;
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        String testSecret = Base64.getEncoder()
                .encodeToString(new byte[32]);

        jwtService = new JwtService(testSecret, 900000);
        userDetailsService = mock(DatabaseUserDetailsService.class);

        filter = new JwtAuthenticationFilter(
                jwtService,
                userDetailsService
        );

        filterChain = mock(FilterChain.class);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldContinueWhenBearerTokenIsMissing() throws Exception {
        MockHttpServletRequest request =
                new MockHttpServletRequest();
        MockHttpServletResponse response =
                new MockHttpServletResponse();

        filter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verifyNoInteractions(userDetailsService);

        assertNull(
                SecurityContextHolder.getContext().getAuthentication()
        );
        assertEquals(200, response.getStatus());
    }

    @Test
    void shouldAuthenticateValidBearerTokenWithCurrentAuthorities()
            throws Exception {
        String token = jwtService.generateToken("test-user-123");

        UserDetails userDetails = User
                .withUsername("test-user-123")
                .password("irrelevant-test-password")
                .authorities("ROLE_ORG_ADMIN")
                .build();

        when(userDetailsService.loadUserByUsername("test-user-123"))
                .thenReturn(userDetails);

        MockHttpServletRequest request =
                new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        filter.doFilter(request, response, filterChain);

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        assertNotNull(authentication);
        assertEquals("test-user-123", authentication.getName());
        assertTrue(authentication.isAuthenticated());

        assertTrue(authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ORG_ADMIN")));

        verify(userDetailsService)
                .loadUserByUsername("test-user-123");
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldRejectInvalidBearerToken() throws Exception {
        MockHttpServletRequest request =
                new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer invalid-token");

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        filter.doFilter(request, response, filterChain);

        assertEquals(401, response.getStatus());
        assertNull(
                SecurityContextHolder.getContext().getAuthentication()
        );

        verifyNoInteractions(userDetailsService);
        verify(filterChain, never()).doFilter(request, response);
    }

    @Test
    void shouldRejectBlankBearerToken() throws Exception {
        MockHttpServletRequest request =
                new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer   ");

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        filter.doFilter(request, response, filterChain);

        assertEquals(401, response.getStatus());
        verify(filterChain, never()).doFilter(request, response);
    }

    @Test
    void shouldContinueWithoutAuthenticatingForNonBearerHeader()
            throws Exception {
        MockHttpServletRequest request =
                new MockHttpServletRequest();
        request.addHeader("Authorization", "Basic abc123");

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        filter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verifyNoInteractions(userDetailsService);

        assertNull(
                SecurityContextHolder.getContext().getAuthentication()
        );
    }

    @Test
    void shouldRejectDisabledUser() throws Exception {
        String token = jwtService.generateToken("disabled-user");

        UserDetails disabledUser = User
                .withUsername("disabled-user")
                .password("irrelevant-test-password")
                .authorities("ROLE_EMPLOYEE")
                .disabled(true)
                .build();

        when(userDetailsService.loadUserByUsername("disabled-user"))
                .thenReturn(disabledUser);

        MockHttpServletRequest request =
                new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        filter.doFilter(request, response, filterChain);

        assertEquals(401, response.getStatus());
        assertNull(
                SecurityContextHolder.getContext().getAuthentication()
        );
        verify(filterChain, never()).doFilter(request, response);
    }

    @Test
    void shouldRejectUserMissingFromDatabase() throws Exception {
        String token = jwtService.generateToken("deleted-user");

        when(userDetailsService.loadUserByUsername("deleted-user"))
                .thenThrow(new UsernameNotFoundException("User not found"));

        MockHttpServletRequest request =
                new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        filter.doFilter(request, response, filterChain);

        assertEquals(401, response.getStatus());
        assertNull(
                SecurityContextHolder.getContext().getAuthentication()
        );
        verify(filterChain, never()).doFilter(request, response);
    }
}