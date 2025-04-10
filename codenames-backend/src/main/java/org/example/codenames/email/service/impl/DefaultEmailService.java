package org.example.codenames.email.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.HttpServletRequest;

import org.example.codenames.email.entity.EmailRequest;
import org.example.codenames.email.service.api.EmailService;

import org.example.codenames.passwordResetToken.service.api.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

/**
 * Default implementation of the EmailService interface.
 * Provides functionality to send emails, including standard and confirmation emails.
 */
@Service
public class DefaultEmailService implements EmailService {
    /**
     * Service for sending emails through JavaMail.
     */
    private final JavaMailSender mailSender;


    private final PasswordResetService passwordResetService;

    /**
     * Constructs a DefaultEmailService with the specified JavaMailSender and passwordResetService.
     *
     * @param mailSender the JavaMailSender instance for sending emails
     * @param passwordResetService the PasswordResetService instance for managing password reset
     */
    @Autowired
    public DefaultEmailService(JavaMailSender mailSender, PasswordResetService passwordResetService) {
        this.mailSender = mailSender;
        this.passwordResetService = passwordResetService;
    }

    /**
     * Sends a standard e-mail containing data from an EmailRequest.
     *
     * @param request the e-mail request containing recipient details and message content
     */
    public void sendEmail(EmailRequest request) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo("codenames.contact@gmail.com");
        mailMessage.setSubject("Codenames Contact Form");
        mailMessage.setText(request.getEmail() + "\n" + request.getDataToSend());
        mailSender.send(mailMessage);
    }

    /**
     * Sends a confirmation e-mail to the specified user in the appropriate language.
     * The e-mail template is selected based on the provided language parameter.
     *
     * @param userEmail the recipient's e-mail address
     * @param language  the language preference ("pl" for Polish, defaults to English)
     * @throws MessagingException if an error occurs while creating or sending the e-mail
     * @throws IOException if an error occurs while reading the e-mail template file
     */
    public void sendConfirmationEmail(String userEmail, String language) throws MessagingException, IOException {
        ClassPathResource resource;

        // Select the appropriate email template based on language preference
        if ("pl".equals(language)) {
            resource = new ClassPathResource("mail-templates/message_received_templates/message_received_pl.html");
        }
        else {
            resource = new ClassPathResource("mail-templates/message_received_templates/message_received_en.html");
        }

        // Read the HTML email content from the selected template file
        String htmlContent = new String(Files.readAllBytes(resource.getFile().toPath()), StandardCharsets.UTF_8);

        // Create and configure a MIME email message
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

        helper.setTo(userEmail);
        helper.setSubject("Confirmation Email");
        helper.setText(htmlContent, true);

        // Send the email
        mailSender.send(mimeMessage);
    }

    /**
     * Sends a password reset email to the specified user in the appropriate language.
     * The e-mail template is selected based on the provided language parameter.
     *
     * @param userEmail the recipient's email address
     * @param request the HTTP request containing additional context (such as IP address) for the password reset operation
     * @param language the language preference ("pl" for Polish, defaults to English)
     * @throws MessagingException if an error occurs while creating or sending the email
     * @throws IOException if an error occurs while reading the email template file
     */
    public void sendResetPasswordEmail(String userEmail, HttpServletRequest request, String language) throws MessagingException, IOException {
        ClassPathResource resource;

        if (userEmail == null) {
            throw new IllegalArgumentException("Email cannot be null.");
        }
        if ("pl".equals(language)) {
            resource = new ClassPathResource("mail-templates/forgot_password_templates/reset_password_pl.html");
        }
        else {
            resource = new ClassPathResource("mail-templates/forgot_password_templates/reset_password_en.html");
        }

        String htmlContent = new String(Files.readAllBytes(resource.getFile().toPath()), StandardCharsets.UTF_8);

        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

        String token = passwordResetService.createResetToken(userEmail, request);

        String resetLink = "http://localhost:5173/reset-password?token=" + token;

        htmlContent = htmlContent.replace("{{reset_link}}", resetLink);
        helper.setTo(userEmail);
        helper.setSubject("Password Reset Request");
        helper.setText(htmlContent, true);
        mailSender.send(mimeMessage);
    }
}
