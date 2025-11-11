package org.example.codenames.tokens.accountActivationToken.service.impl;

import org.example.codenames.jwt.JwtService;
import org.example.codenames.tokens.accountActivationToken.entity.AccountActivationToken;
import org.example.codenames.tokens.accountActivationToken.repository.api.AccountActivationTokenRepository;
import org.example.codenames.tokens.accountActivationToken.service.api.AccountActivationTokenService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class DefaultAccountActivationTokenService implements AccountActivationTokenService {

    private final AccountActivationTokenRepository accountActivationTokenRepository;
    private final JwtService jwtService;

    public DefaultAccountActivationTokenService(AccountActivationTokenRepository accountActivationTokenRepository, JwtService jwtService) {
        this.accountActivationTokenRepository = accountActivationTokenRepository;
        this.jwtService = jwtService;
    }

    /**
     * Creates a unique account activation token for the given user's email address.
     *
     * @param userEmail the recipient's e-mail address
     * @return unique token that can be used to activate user's account.
     */
    @Override
    public String createAccountActivationToken(String username, String userEmail) {
        String token = jwtService.generateToken(username);

        AccountActivationToken accountActivationToken = AccountActivationToken.builder()
                .token(token)
                .userEmail(userEmail)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .used(false)
                .build();


        accountActivationTokenRepository.save(accountActivationToken);

        return token;
    }

    /**
     * Validates the provided account activation token.
     *
     * @param token the account activation token provided by the user
     * @return {@code true} if the token is valid (i.e., exists in the repository and can be used),
     * {@code false} otherwise (e.g., if the token is not found in the repository).
     */
    @Override
    public boolean isValidToken(String token) {
        Optional<AccountActivationToken> optional = accountActivationTokenRepository.findByToken(token);

        if (optional.isEmpty()) {
            return false;
        }

        AccountActivationToken accountActivationToken = optional.get();

        if (accountActivationToken.isUsed()) {
            return false;
        }

        if (accountActivationToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            return false;
        }

        accountActivationToken.setUsed(true);

        accountActivationTokenRepository.save(accountActivationToken);

        return true;
    }
}
