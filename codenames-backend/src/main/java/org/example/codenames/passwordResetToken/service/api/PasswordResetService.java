package org.example.codenames.passwordResetToken.service.api;

import jakarta.servlet.http.HttpServletRequest;

/**
 * PasswordReset service interface.
 */
public interface PasswordResetService {
    String createResetToken(String userEmail, HttpServletRequest request);

    boolean isValidToken(String token, HttpServletRequest request);

    String getClientIp(HttpServletRequest request);
}
