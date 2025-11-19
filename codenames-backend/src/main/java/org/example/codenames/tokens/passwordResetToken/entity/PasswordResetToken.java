package org.example.codenames.tokens.passwordResetToken.entity;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Entity class for the PasswordResetToken object.
 */
@Document(collection = "password_reset_tokens")
@Data
@Builder
public class PasswordResetToken {
    @Id
    private String token;
    private String userEmail;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private boolean used;
    private String requestedIp;
    private String usedIp;
}
