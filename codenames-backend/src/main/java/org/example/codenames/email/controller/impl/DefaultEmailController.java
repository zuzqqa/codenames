package org.example.codenames.email.controller.impl;

import jakarta.mail.MessagingException;
import org.example.codenames.email.controller.api.EmailController;
import org.example.codenames.email.entity.EmailRequest;
import org.example.codenames.email.service.api.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

/**
 * Default implementation of the EmailController interface.
 * Provides functionality to send emails.
 */
@RestController
@RequestMapping("/api/email")
public class DefaultEmailController implements EmailController {
    /**
     * The EmailService instance for sending emails.
     */
    private final EmailService emailService;

    /**
     * Constructs a DefaultEmailController with the specified EmailService.
     *
     * @param emailService the EmailService instance for sending emails
     */
    @Autowired
    public DefaultEmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    /**
     * Sends an email with the specified request and language.
     *
     * @param request the email request containing recipient details and message content
     * @param language the language preference ("pl" for Polish, defaults to English)
     * @return a ResponseEntity with an empty body and an OK status
     * @throws MessagingException if an error occurs while sending the email
     * @throws IOException if an error occurs while reading the email template file
     */
    @PostMapping("/send-report")
    public ResponseEntity<String> sendEmail(@RequestBody EmailRequest request, String language) throws MessagingException, IOException {
        emailService.sendEmail(request);
        emailService.sendConfirmationEmail(request.getEmail(), language);
        return ResponseEntity.ok("");
    }
}
