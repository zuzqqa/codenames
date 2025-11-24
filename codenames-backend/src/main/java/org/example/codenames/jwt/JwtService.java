package org.example.codenames.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Service responsible for handling JWT operations such as token generation, validation, and extraction of claims.
 */
@SuppressWarnings("deprecation")
@Service
public class JwtService {
    /**
     * Secret key used for signing JWT tokens.
     */
    @Value("${secret}")
    public String SECRET = "";

    /**
     * Extracts the username from the given JWT token.
     *
     * @param token the JWT token
     * @return the extracted username
     */
    public String ExtractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extracts the expiration date from the given JWT token.
     *
     * @param token the JWT token
     * @return the extracted expiration date
     */
    public Date ExtractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extracts a specific claim from the given JWT token using the provided claims resolver function.
     *
     * @param <T>            the type of the claim
     * @param token          the JWT token
     * @param claimsResolver function to extract the specific claim
     * @return the extracted claim
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extracts all claims from the given JWT token.
     *
     * @param token the JWT token
     * @return all claims extracted from the token
     */
    public Claims extractAllClaims(String token) {
        return Jwts
                .parser()
                .setSigningKey(SECRET)
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Checks if the given JWT token has expired.
     *
     * @param token the JWT token
     * @return true if the token has expired, false otherwise
     */
    public Boolean isTokenExpired(String token) {
        return ExtractExpiration(token).before(new Date());
    }

    /**
     * Validates the given JWT token against the provided user details.
     *
     * @param token       the JWT token
     * @param userDetails the user details to validate against
     * @return true if the token is valid, false otherwise
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = ExtractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    /**
     * Generates a new JWT token for the given username.
     *
     * @param username the username for which to generate the token
     * @return the generated JWT token
     */
    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, username);
    }

    /**
     * Creates a JWT token with the given claims and username.
     *
     * @param claims   additional claims to include in the token
     * @param username the username for which to create the token
     * @return the created JWT token
     */
    private String createToken(Map<String, Object> claims, String username) {
        return Jwts
                .builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10))
                .signWith(SignatureAlgorithm.HS256, getSignKey())
                .compact();
    }

    /**
     * Extracts the username from the given JWT token.
     *
     * @param token the JWT token
     * @return the extracted username
     */
    public String getUsernameFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /**
     * Retrieves the signing key used for verifying JWT tokens.
     *
     * @return the signing key
     */
    public Key getSignKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(SECRET));
    }
}
