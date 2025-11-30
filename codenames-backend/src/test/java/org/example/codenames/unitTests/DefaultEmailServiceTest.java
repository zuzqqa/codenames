package org.example.codenames.unitTests;

import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.HttpServletRequest;
import org.example.codenames.email.entity.EmailRequest;
import org.example.codenames.email.service.impl.DefaultEmailService;
import org.example.codenames.tokens.accountActivationToken.service.api.AccountActivationTokenService;
import org.example.codenames.tokens.passwordResetToken.service.api.PasswordResetServiceToken;
import org.example.codenames.util.ResourceUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DefaultEmailServiceTest {

    @Mock
    JavaMailSender mailSender;

    @Mock
    PasswordResetServiceToken passwordResetServiceToken;

    @Mock
    AccountActivationTokenService accountActivationTokenService;

    @InjectMocks
    DefaultEmailService service;

    @Mock
    HttpServletRequest request;

    @Test
    void sendEmail_callsMailSender() {
        EmailRequest er = new EmailRequest();
        er.setEmail("a@b.c");
        er.setDataToSend("hello");

        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        service.sendEmail(er);

        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendResetPasswordEmail_createsTokenAndSends() throws Exception {
        when(passwordResetServiceToken.createResetToken(eq("a@b.c"), any())).thenReturn("tok123");

        MimeMessage mm = mock(MimeMessage.class);
        when(mailSender.createMimeMessage()).thenReturn(mm);
        doNothing().when(mailSender).send(mm);

        try (MockedStatic<ResourceUtils> mocked = mockStatic(ResourceUtils.class)) {
            mocked.when(() -> ResourceUtils.readResourceContent(any(ClassPathResource.class))).thenReturn("<html>{{reset_link}}</html>");

            service.sendResetPasswordEmail("a@b.c", request, "en");
        }

        verify(passwordResetServiceToken, times(1)).createResetToken(eq("a@b.c"), any());
        verify(mailSender, times(1)).send(mm);
    }

    @Test
    void sendAccountActivationEmail_usesAccountService_and_sends() throws Exception {
        when(accountActivationTokenService.createAccountActivationToken(eq("user"), eq("a@b.c"))).thenReturn("acttok");
        MimeMessage mm = mock(MimeMessage.class);
        when(mailSender.createMimeMessage()).thenReturn(mm);
        doNothing().when(mailSender).send(mm);

        try (MockedStatic<ResourceUtils> mocked = mockStatic(ResourceUtils.class)) {
            mocked.when(() -> ResourceUtils.readResourceContent(any(ClassPathResource.class))).thenReturn("<html>${activationLink}</html>");

            service.sendAccountActivationEmail("user", "a@b.c", "en");
        }

        verify(accountActivationTokenService, times(1)).createAccountActivationToken("user", "a@b.c");
        verify(mailSender, times(1)).send(mm);
    }
}
