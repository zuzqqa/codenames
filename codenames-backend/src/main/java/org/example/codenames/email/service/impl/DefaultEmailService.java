package org.example.codenames.email.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.HttpServletRequest;
import org.example.codenames.email.entity.EmailRequest;
import org.example.codenames.email.service.api.EmailService;
import org.example.codenames.tokens.accountActivationToken.service.api.AccountActivationTokenService;
import org.example.codenames.tokens.passwordResetToken.service.api.PasswordResetServiceToken;
import org.example.codenames.util.ResourceUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

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
    private final PasswordResetServiceToken passwordResetServiceToken;
    private final AccountActivationTokenService accountActivationTokenService;
    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;
    @Value("${backend.url:http://localhost:8080}")
    private String backendUrl;

    /**
     * Constructs a DefaultEmailService with the specified JavaMailSender and passwordResetService.
     *
     * @param mailSender                the JavaMailSender instance for sending emails
     * @param passwordResetServiceToken the PasswordResetService instance for managing password reset
     */
    @Autowired
    public DefaultEmailService(JavaMailSender mailSender, PasswordResetServiceToken passwordResetServiceToken, AccountActivationTokenService accountActivationTokenService) {
        this.mailSender = mailSender;
        this.passwordResetServiceToken = passwordResetServiceToken;
        this.accountActivationTokenService = accountActivationTokenService;
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
     */
    public void sendConfirmationEmail(String userEmail, String language) throws MessagingException {
        if (userEmail == null || userEmail.trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be null.");
        }

        String languageCode = (language != null) ? language.toLowerCase().trim() : "en";

        String templatePath = "mail-templates/message_received_templates/message_received_" + languageCode + ".html";

        try {
            ClassPathResource resource = new ClassPathResource(templatePath);
            String htmlContent = ResourceUtils.readResourceContent(resource);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());

            helper.setTo(userEmail);
            helper.setSubject(languageCode.equals("pl") ? "Potwierdzenie" : "Confirmation Email");
            helper.setText(htmlContent, true);

            mailSender.send(mimeMessage);
        } catch (IOException ex) {
            throw new MessagingException("Could not read email template", ex);
        }
    }

    /**
     * Sends a password reset email to the specified user in the appropriate language.
     * The e-mail template is selected based on the provided language parameter.
     *
     * @param userEmail the recipient's email address
     * @param request   the HTTP request containing additional context (such as IP address) for the password reset operation
     * @param language  the language preference ("pl" for Polish, defaults to English)
     * @throws MessagingException if an error occurs while creating or sending the email
     */
    public void sendResetPasswordEmail(String userEmail, HttpServletRequest request, String language) throws MessagingException {
        if (userEmail == null || userEmail.trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be null.");
        }

        String languageCode = (language != null) ? language.toLowerCase().trim() : "en";

        String templatePath = "mail-templates/forgot_password_templates/reset_password_" + languageCode + ".html";

        try {
            ClassPathResource resource = new ClassPathResource(templatePath);
            String htmlContent = ResourceUtils.readResourceContent(resource);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());

            String token = passwordResetServiceToken.createResetToken(userEmail, request);
            String resetLink = frontendUrl + "/reset-password?token=" + token;
            htmlContent = htmlContent.replace("{{reset_link}}", resetLink);

            helper.setTo(userEmail);
            helper.setSubject(languageCode.equals("pl") ? "Prośba o zmianę hasła" : "Password Reset Request");
            helper.setText(htmlContent, true);

            mailSender.send(mimeMessage);
        } catch (IOException ex) {
            throw new MessagingException("Could not read email template", ex);
        }
    }

    public void sendAccountActivationEmail(String username, String userEmail, String language) throws MessagingException {
        if (userEmail == null || userEmail.trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be null.");
        }

        String languageCode = (language != null) ? language.toLowerCase().trim() : "en";
        String templatePath = "mail-templates/activate_account_templates/activate_account_" + languageCode + ".html";

        try {
            ClassPathResource resource = new ClassPathResource(templatePath);
            String htmlContent = ResourceUtils.readResourceContent(resource);

            String token = accountActivationTokenService.createAccountActivationToken(username, userEmail);
            String activationLink = backendUrl + "/api/users/activate/" + token;

            htmlContent = htmlContent.replace("${activationLink}", activationLink);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());

            helper.setTo(userEmail);
            helper.setSubject(languageCode.equals("pl") ? "Aktywacja konta" : "Account activation");
            helper.setText(htmlContent, true);

            mailSender.send(mimeMessage);
        } catch (IOException ex) {
            throw new MessagingException("Could not read email template", ex);
        }
    }
}
