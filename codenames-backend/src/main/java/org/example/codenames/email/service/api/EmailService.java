package org.example.codenames.email.service.api;

import jakarta.mail.MessagingException;

import org.example.codenames.email.entity.EmailRequest;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.UUID;

/**
 * Service interface for handling email-related operations.
 */
@Service
public interface EmailService {
    void sendEmail(EmailRequest request);

    void sendConfirmationEmail(String userEmail, String language) throws MessagingException, IOException;

    void sendResetPasswordEmail(String userId, String language) throws MessagingException, IOException;
}
