package org.example.codenames.email.service.api;

import jakarta.mail.MessagingException;

import org.example.codenames.email.entity.EmailRequest;

import org.springframework.stereotype.Service;

import java.io.IOException;

/**
 * Service interface for handling email-related operations.
 */
@Service
public interface EmailService {
    /**
     * Sends an email based on the provided request.
     *
     * @param request The {@link EmailRequest} containing email details.
     */
    void sendEmail(EmailRequest request);

    /**
     * Sends a confirmation email to the specified user.
     *
     * @param userEmail The recipient's email address.
     * @param language The language code for selecting the appropriate email template.
     * @throws MessagingException If an error occurs while creating or sending the email.
     * @throws IOException If an error occurs while reading the email template.
     */
    void sendConfirmationEmail(String userEmail, String language) throws MessagingException, IOException;
}
