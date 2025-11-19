package org.example.codenames.tokens.accountActivationToken.entity;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "account_activation_tokens")
@Data
@Builder
public class AccountActivationToken {

    @Id
    private String token;
    private String userEmail;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private boolean used;
}
