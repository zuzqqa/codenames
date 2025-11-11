package org.example.codenames.tokens.passwordResetToken.service.api;

import jakarta.servlet.http.HttpServletRequest;

/**
 * PasswordReset service interface.
 */
public interface PasswordResetServiceToken {

    String createResetToken(String userEmail, HttpServletRequest request);

    boolean isValidToken(String token);

    void tokenUsed(String token, HttpServletRequest request);

    String getClientIp(HttpServletRequest request);
}
