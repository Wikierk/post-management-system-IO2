package org.IO2.backend.security;

import org.IO2.backend.model.Role;
import org.IO2.backend.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private User testUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86400000L);

        testUser = new User();
        testUser.setEmail("test-auth@poczta.pl");
        testUser.setRole(Role.CLIENT);
    }

    @Test
    void shouldGenerateAndValidateTokenSuccessfully() {
        String token = jwtService.generateToken(testUser);

        assertNotNull(token, "Wygenerowany token nie powinien być null");
        assertTrue(jwtService.isTokenValid(token, testUser), "Walidacja tokenu powinna przejść pomyślnie dla tego samego użytkownika");
    }

    @Test
    void shouldExtractUsernameCorrectly() {
        String token = jwtService.generateToken(testUser);
        String extractedUsername = jwtService.extractUsername(token);
        
        assertEquals("test-auth@poczta.pl", extractedUsername, "Zdekodowany email powinien się zgadzać z danymi użytkownika");
    }
}
