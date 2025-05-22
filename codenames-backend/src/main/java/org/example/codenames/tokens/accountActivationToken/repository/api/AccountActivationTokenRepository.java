package org.example.codenames.tokens.accountActivationToken.repository.api;

import org.example.codenames.tokens.accountActivationToken.entity.AccountActivationToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountActivationTokenRepository extends MongoRepository<AccountActivationToken, String> {
    Optional<AccountActivationToken> findByToken(String token);
}
