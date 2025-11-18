package org.example.codenames.unitTests;

import jakarta.servlet.http.HttpServletRequest;
import org.example.codenames.tokens.passwordResetToken.entity.PasswordResetToken;
import org.example.codenames.tokens.passwordResetToken.repository.api.PasswordResetTokenRepository;
import org.example.codenames.tokens.passwordResetToken.service.impl.DefaultPasswordResetServiceToken;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DefaultPasswordResetServiceTokenTest {

    @Mock
    PasswordResetTokenRepository repository;

    @InjectMocks
    DefaultPasswordResetServiceToken service;

    @Mock
    HttpServletRequest request;

    @Test
    void createResetToken_savesTokenAndReturnsString() {
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");

        String token = service.createResetToken("a@b.c", request);

        assertNotNull(token);
        verify(repository, times(1)).save(any(PasswordResetToken.class));
    }

    @Test
    void isValidToken_falseWhenNotFound() {
        when(repository.findByToken("t")).thenReturn(Optional.empty());

        assertFalse(service.isValidToken("t"));
    }

    @Test
    void isValidToken_falseWhenUsed() {
        PasswordResetToken prt = PasswordResetToken.builder().used(true).expiresAt(LocalDateTime.now().plusMinutes(5)).build();
        when(repository.findByToken("t")).thenReturn(Optional.of(prt));

        assertFalse(service.isValidToken("t"));
    }

    @Test
    void isValidToken_falseWhenExpired() {
        PasswordResetToken prt = PasswordResetToken.builder().used(false).expiresAt(LocalDateTime.now().minusMinutes(5)).build();
        when(repository.findByToken("t")).thenReturn(Optional.of(prt));

        assertFalse(service.isValidToken("t"));
    }

    @Test
    void tokenUsed_setsUsedAndSaves() {
        PasswordResetToken prt = PasswordResetToken.builder().used(false).expiresAt(LocalDateTime.now().plusMinutes(5)).build();
        when(repository.findByToken("t")).thenReturn(Optional.of(prt));
        when(request.getRemoteAddr()).thenReturn("192.168.0.1");

        service.tokenUsed("t", request);

        assertTrue(prt.isUsed());
        verify(repository, times(1)).save(prt);
    }

    @Test
    void getClientIp_prefersHeader() {
        when(request.getHeader("X-Forwarded-For")).thenReturn("10.0.0.1");

        String ip = service.getClientIp(request);

        assertEquals("10.0.0.1", ip);
    }

    @Test
    void getClientIp_fallsBackToRemoteAddr() {
        when(request.getHeader(anyString())).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");

        String ip = service.getClientIp(request);

        assertEquals("127.0.0.1", ip);
    }
}
