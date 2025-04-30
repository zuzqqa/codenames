package org.example.codenames.passwordResetToken.service.impl;

import jakarta.servlet.http.HttpServletRequest;

import org.example.codenames.passwordResetToken.entity.PasswordResetToken;
import org.example.codenames.passwordResetToken.repository.api.PasswordResetTokenRepository;
import org.example.codenames.passwordResetToken.service.api.PasswordResetService;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

import java.util.Optional;
import java.util.UUID;

/**
 * Default implementation of the {@link PasswordResetService} interface.
 */
@Service
public class DefaultPasswordResetService implements PasswordResetService {
    /**
     * Repository for managing password reset tokens in the database.
     */
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    /**
     * Constructs a new DefaultUserService with the given passwordResetTokenRepository.
     *
     * @param passwordResetTokenRepository the password reset tokens repository
     */
    public DefaultPasswordResetService(PasswordResetTokenRepository passwordResetTokenRepository) {
        this.passwordResetTokenRepository = passwordResetTokenRepository;
    }

    /**
     * Creates a unique password reset token for the given user's email address.
     *
     * @param userEmail the recipient's e-mail address
     * @param request the HTTP request containing additional context (such as IP address) for the password reset operation
     * @return unique token that can be used to reset the user's password
     */
    @Override
    public String createResetToken(String userEmail, HttpServletRequest request) {
        String token = UUID.randomUUID().toString();

        PasswordResetToken passwordResetToken = new PasswordResetToken();
        passwordResetToken.setToken(token);
        passwordResetToken.setUserEmail(userEmail);
        passwordResetToken.setCreatedAt(LocalDateTime.now());
        passwordResetToken.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        passwordResetToken.setUsed(false);
        passwordResetToken.setRequestedIp(getClientIp(request));

        passwordResetTokenRepository.save(passwordResetToken);

        return token;
    }

    /**
     * Validates the provided password reset token.
     *
     * @param token the password reset token provided by the user
     * @param request the HTTP request containing additional context (such as IP address) for the password reset operation
     * @return {@code true} if the token is valid (i.e., exists in the repository and can be used),
     *         {@code false} otherwise (e.g., if the token is not found in the repository).
     */
    @Override
    public boolean isValidToken(String token, HttpServletRequest request) {
        Optional<PasswordResetToken> optional = passwordResetTokenRepository.findByToken(token);

        if (optional.isEmpty()) {
            return false;
        }

        PasswordResetToken passwordResetToken = optional.get();

        if (passwordResetToken.isUsed()) {
            return false;
        }

        if(passwordResetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            return false;
        }

        passwordResetToken.setUsed(true);
        passwordResetToken.setUsedIp(getClientIp(request));

        passwordResetTokenRepository.save(passwordResetToken);

        return true;
    }

    /**
     * Retrieves the client's IP address from the HTTP request.
     *
     * @param request the HTTP request containing additional context (such as IP address) for the password reset operation
     * @return the client's IP address as a string, or the remote address of the request if no IP is found in the headers.
     */
    @Override
    public String getClientIp(HttpServletRequest request) {
        String[] headerNames = {
                "X-Forwarded-For",
                "Proxy-Client-IP",
                "WL-Proxy-Client-IP",
                "HTTP_CLIENT_IP",
                "HTTP_X_FORWARDED_FOR"
        };

        for (String header : headerNames) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                return ip.split(",")[0].trim();
            }
        }

        return request.getRemoteAddr();
    }
}
