package org.example.codenames.tokens.accountActivationToken.service.api;

public interface AccountActivationTokenService {

    String createAccountActivationToken(String username, String userEmail);

    boolean isValidToken(String token);
}
