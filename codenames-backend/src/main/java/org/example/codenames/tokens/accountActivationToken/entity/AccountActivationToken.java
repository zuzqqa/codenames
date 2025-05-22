package org.example.codenames.tokens.accountActivationToken.entity;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Entity class for the PasswordResetToken object.
 */
@Document(collection = "account_activation_tokens")
@Data
@Builder
public class AccountActivationToken {
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
}
