package org.example.codenames.unitTests;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.example.codenames.email.entity.EmailRequest;
import org.example.codenames.email.service.impl.DefaultEmailService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.MailException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

import java.io.IOException;
import java.nio.file.Files;

import org.example.codenames.email.service.api.EmailService;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;


/**
 * Unit tests for the {@link EmailService} EmailService interface default implementation.
 */
@ExtendWith(MockitoExtension.class)
class EmailServiceTest {
    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private DefaultEmailService emailService;

    /**
     * Test that verifies the sendEmail method sends an email.
     */
    @Test
    void sendEmail_ShouldSendEmail() {
        EmailRequest request = new EmailRequest("test@example.com", "Test message");

        emailService.sendEmail(request);

        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    /**
     * Test that verifies the sendEmail method throws a MailException when the email sending fails.
     * @throws MessagingException if an error occurs while creating or sending the email.
     * @throws IOException if an error occurs while reading the email template file.
     */
    @Test
    void sendConfirmationEmail_ShouldSendConfirmationEmail() throws MessagingException, IOException {
        String userEmail = "user@example.com";
        String language = "en";
        ClassPathResource resource = new ClassPathResource("mail-templates/message_received_templates/message_received_en.html");
        String htmlContent = Files.readString(resource.getFile().toPath());

        MimeMessageHelper helper = mock(MimeMessageHelper.class);
        when(mailSender.createMimeMessage()).thenReturn(mock(MimeMessage.class));
        doNothing().when(mailSender).send(any(MimeMessage.class));

        emailService.sendConfirmationEmail(userEmail, language);

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }


    /**
     * Test that verifies the sendEmail method throws a MailException when the email sending fails.
     * @throws MessagingException if an error occurs while creating or sending the email.
     * @throws IOException if an error occurs while reading the email template file.
     */
    @Test
    void sendConfirmationEmail_ShouldThrowMailException() throws MessagingException, IOException {
        String userEmail = "user@example.com";
        String language = "en";

        when(mailSender.createMimeMessage()).thenReturn(mock(MimeMessage.class));
        doThrow(new MailSendException("Email sending failed")).when(mailSender).send(any(MimeMessage.class));

        assertThrows(MailException.class, () -> emailService.sendConfirmationEmail(userEmail, language));
    }

}
