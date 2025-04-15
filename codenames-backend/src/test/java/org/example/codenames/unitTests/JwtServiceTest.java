package org.example.codenames.unitTests;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.example.codenames.jwt.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(MockitoExtension.class)
public class JwtServiceTest {
    @InjectMocks
    private JwtService jwtService;

    private final String SECRET = "mysecretkeymysecretkeymysecretkeymysecretkey";
    private Key key;

    @BeforeEach
    void setUp() {
        jwtService.SECRET = SECRET;
        key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(SECRET));
    }

    @Test
    void testExtractUsername() {
        String token = createTestToken("testuser");
        String username = jwtService.ExtractUsername(token);
        assertEquals("testuser", username);
    }

    @Test
    void testExtractExpiration() {
        String token = createTestToken("testuser");
        Date expiration = jwtService.ExtractExpiration(token);
        assertTrue(expiration.after(new Date()));
    }

    @Test
    void testValidateToken() {
        String token = createTestToken("testuser");
        UserDetails userDetails = User.withUsername("testuser").password("password").authorities("USER").build();
        assertTrue(jwtService.validateToken(token, userDetails));
    }

    @Test
    void testGenerateToken() {
        String token = jwtService.generateToken("testuser");
        assertNotNull(token);
        assertEquals("testuser", jwtService.ExtractUsername(token));
    }

    @Test
    void testGetUsernameFromToken() {
        String token = createTestToken("testuser");
        String username = jwtService.getUsernameFromToken(token);
        assertEquals("testuser", username);
    }

    private String createTestToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10))
                .signWith(SignatureAlgorithm.HS256, key)
                .compact();
    }
}
