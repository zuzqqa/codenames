package org.example.codenames.email.service.api;

import jakarta.mail.MessagingException;

import jakarta.servlet.http.HttpServletRequest;
import org.example.codenames.email.entity.EmailRequest;

import org.springframework.stereotype.Service;

import java.io.IOException;

/**
 * Service interface for handling email-related operations.
 */
@Service
public interface EmailService {
    void sendEmail(EmailRequest request);

    void sendConfirmationEmail(String userEmail, String language) throws MessagingException, IOException;

    void sendResetPasswordEmail(String userEmail, HttpServletRequest request, String language) throws MessagingException, IOException;
}
