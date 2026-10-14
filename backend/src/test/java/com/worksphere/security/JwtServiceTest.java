package com.worksphere.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        // Test-only secret: 32 bytes. Never use this in production.
        String testSecret = Base64.getEncoder()
                .encodeToString(new byte[32]);

        jwtService = new JwtService(testSecret, 900000);
    }

    @Test
    void shouldGenerateAndValidateToken() {
        String token = jwtService.generateToken("test-user-123");

        assertNotNull(token);
        assertFalse(token.isBlank());
        assertTrue(jwtService.isTokenValid(token));
    }

    @Test
    void shouldExtractSubjectFromToken() {
        String token = jwtService.generateToken("test-user-123");

        assertEquals("test-user-123",
                jwtService.extractSubject(token));
    }

    @Test
    void shouldRejectInvalidToken() {
        assertFalse(jwtService.isTokenValid("not-a-valid-jwt"));
    }

    @Test
    void shouldRejectTamperedToken() {
        String token = jwtService.generateToken("test-user-123");
        String tamperedToken = token + "tampered";

        assertFalse(jwtService.isTokenValid(tamperedToken));
    }

    @Test
    void shouldRejectBlankToken() {
        assertFalse(jwtService.isTokenValid(""));
        assertFalse(jwtService.isTokenValid("   "));
        assertFalse(jwtService.isTokenValid(null));
    }

    @Test
    void shouldRejectBlankSubject() {
        assertThrows(IllegalArgumentException.class,
                () -> jwtService.generateToken(" "));
    }

    @Test
    void shouldRejectShortSecret() {
        String shortSecret = Base64.getEncoder()
                .encodeToString(new byte[16]);

        assertThrows(IllegalArgumentException.class,
                () -> new JwtService(shortSecret, 900000));
    }

    @Test
    void shouldRejectNonPositiveExpiration() {
        String testSecret = Base64.getEncoder()
                .encodeToString(new byte[32]);

        assertThrows(IllegalArgumentException.class,
                () -> new JwtService(testSecret, 0));
    }
}