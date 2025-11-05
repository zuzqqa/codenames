package org.example.codenames.discord.controller.api;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.example.codenames.discord.controller.impl.DiscordLinkController;
import org.example.codenames.jwt.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Map;

/**
 * {@code LinkDiscordController} provides an endpoint to initiate
 * the process of linking an existing user account with a Discord account.
 * <p>
 * This endpoint validates the application JWT token, stores it as a temporary cookie,
 * and returns the frontend redirect URL that triggers the Discord OAuth2 login flow.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/discord/link")
public class LinkDiscordController implements DiscordLinkController {
    /**
     * JWT service used to validate and parse user tokens.
     */
    private final JwtService jwtService;

    /**
     * Whether to mark the temporary cookie as secure (HTTPS-only).
     */
    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    /**
     * Begins the Discord linking process by validating the user's JWT
     * and setting a short-lived cookie to persist the token.
     *
     * @param authHeader The Authorization header with the app's JWT.
     * @param response   The HTTP servlet response to which cookies may be attached.
     * @return 200 OK with redirect URL if successful, or 400 Bad Request if invalid.
     */
    @Override
    @PostMapping("/begin")
    public ResponseEntity<?> begin(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            HttpServletResponse response) {

        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body("Missing Authorization Bearer token");
        }
        String appJwt = authHeader.substring("Bearer ".length());

        jwtService.getUsernameFromToken(appJwt);

        Cookie c = new Cookie("APP_LINK_JWT", appJwt);
        c.setHttpOnly(true);
        c.setSecure(cookieSecure);
        c.setPath("/");
        c.setMaxAge((int) Duration.ofMinutes(5).getSeconds());
        response.addCookie(c);

        return ResponseEntity.ok(Map.of("redirectUrl", "/oauth2/authorization/discord"));
    }
}
