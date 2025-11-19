package org.example.codenames.tokens.accountActivationToken.service.api;

/**
 * Service interface for managing account activation tokens.
 */
public interface AccountActivationTokenService {

    /**
     * Creates a unique account activation token for the given user's email address.
     *
     * @param userEmail the recipient's e-mail address
     * @return unique token that can be used to activate user's account.
     */
    String createAccountActivationToken(String username, String userEmail);

    /**
     * Validates the provided account activation token.
     *
     * @param token the account activation token provided by the user
     * @return {@code true} if the token is valid (i.e., exists in the repository and can be used),
     * {@code false} otherwise (e.g., if the token is not found in the repository).
     */
    boolean isValidToken(String token);
}
