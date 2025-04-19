package org.example.codenames.passwordResetToken.entity;

import lombok.Data;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Entity class for the PasswordResetToken object.
 */
@Document(collection = "password_reset_tokens")
@Data
public class PasswordResetToken {
    /**
     * The unique identifier for the token.
     */
    @Id
    private String token;

    /**
     * The email for the user.
     */
    private String userEmail;

    /**
     * The time token was created.
     */
    private LocalDateTime createdAt;

    /**
     * The time token expires.
     */
    private LocalDateTime expiresAt;

    /**
     * Indicator whether the token was used already.
     */
    private boolean used;

    /**
     * The IP address that requested password change.
     */
    private String requestedIp;

    /**
     * The IP address that changed the password.
     */
    private String usedIp;
}
