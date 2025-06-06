package org.example.codenames.tokens.passwordResetToken.repository.api;

import org.example.codenames.tokens.passwordResetToken.entity.PasswordResetToken;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for PasswordResetToken entity
 */
@Repository
public interface PasswordResetTokenRepository extends MongoRepository<PasswordResetToken, String> {
    Optional<PasswordResetToken> findByToken(String token);
}
