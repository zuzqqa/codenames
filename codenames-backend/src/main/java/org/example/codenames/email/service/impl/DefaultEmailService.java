package org.example.codenames.email.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.example.codenames.email.entity.EmailRequest;
import org.example.codenames.email.service.api.EmailService;

import org.example.codenames.jwt.JwtService;
import org.example.codenames.user.entity.User;
import org.example.codenames.user.repository.api.UserRepository;
import org.example.codenames.user.service.api.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.Optional;
import java.util.UUID;

/**
 * Default implementation of the EmailService interface.
 * Provides functionality to send emails, including standard and confirmation emails.
 */
@Service
public class DefaultEmailService implements EmailService {
    private final JavaMailSender mailSender;
    private final UserService userService;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    /**
     * Constructs a DefaultEmailService with the specified JavaMailSender.
     *
     * @param mailSender the JavaMailSender instance for sending emails
     * @param
     * @param
     */
    @Autowired
    public DefaultEmailService(JavaMailSender mailSender, UserService userService, UserRepository userRepository, JwtService jwtService) {
        this.mailSender = mailSender;
        this.userService = userService;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    /**
     * Sends a standard email containing data from an EmailRequest.
     *
     * @param request the email request containing recipient details and message content
     */
    public void sendEmail(EmailRequest request) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo("codenames.contact@gmail.com");
        mailMessage.setSubject("Codenames Contact Form");
        mailMessage.setText(request.getEmail() + "\n" + request.getDataToSend());
        mailSender.send(mailMessage);
    }

    /**
     * Sends a confirmation email to the specified user in the appropriate language.
     * The email template is selected based on the provided language parameter.
     *
     * @param userEmail the recipient's email address
     * @param language  the language preference ("pl" for Polish, defaults to English)
     * @throws MessagingException if an error occurs while creating or sending the email
     * @throws IOException if an error occurs while reading the email template file
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

    public void sendResetPasswordEmail(String userEmail, String language) throws MessagingException, IOException {
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

        Optional<User> userOptional = userRepository.findByEmail(userEmail);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            String token = jwtService.generateToken(user.getUsername());

            String resetLink = "http://localhost:5173/reset-password?token=" + token;

            htmlContent = htmlContent.replace("{{reset_link}}", resetLink);
            helper.setTo(userEmail);
            helper.setSubject("Password Reset Request");
            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);
        } else {
            throw new UsernameNotFoundException("User not found with email: " + userEmail);
        }
    }
}
