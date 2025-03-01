package org.example.codenames.auth.service.impl;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.example.codenames.jwt.JwtService;
import org.example.codenames.user.entity.User;
import org.example.codenames.user.service.api.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserService userService;

    @Override
    public void onAuthenticationSuccess(
            jakarta.servlet.http.HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        Optional<User> userOptional = userService.getUserByUsername(email);
        if (userOptional.isPresent()) {
            String token = jwtService.generateToken(email);

            Cookie cookie = new Cookie("authToken", token);
            cookie.setHttpOnly(false); // Jeśli używasz httpOnly, frontend nie odczyta ciasteczka
            cookie.setSecure(false); // Zmień na true w produkcji (https)
            cookie.setPath("/");
            cookie.setMaxAge(36000);
            response.addCookie(cookie);
        }

        response.sendRedirect("http://localhost:5173/games"); // Przekierowanie na frontend
    }
}
