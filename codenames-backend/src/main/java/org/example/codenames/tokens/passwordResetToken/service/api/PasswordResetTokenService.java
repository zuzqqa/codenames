package org.example.codenames.tokens.passwordResetToken.service.api;

import jakarta.servlet.http.HttpServletRequest;

/**
 * PasswordReset service interface.
 */
public interface PasswordResetTokenService {

    /**
     * Creates a unique password reset token for the given user's email address.
     * @param userEmail the recipient's e-mail address
     * @param request  the HTTP request containing additional context (such as IP address) for the password reset operation
     * @return unique token that can be used to reset the user's password
     */
    String createResetToken(String userEmail, HttpServletRequest request);

    /**
     * Validates the provided password reset token.
     * @param token the password reset token to validate
     * @return true if the token is valid, false otherwise
     */
    boolean isValidToken(String token);

    /**
     * Marks the provided token as used.
     * @param token the token to mark as used
     * @param request the HTTP request containing additional context (such as IP address) for the password reset operation
     */
    void tokenUsed(String token, HttpServletRequest request);

    /**
     * Extracts the client IP address from the HTTP request.
     * @param request the HTTP request
     * @return the client IP address
     */
    String getClientIp(HttpServletRequest request);
}
