package org.example.codenames.email.service.api;

import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import org.example.codenames.email.entity.EmailRequest;
import org.springframework.stereotype.Service;

/**
 * Default implementation of the EmailService interface.
 * Provides functionality to send emails, including standard and confirmation emails.
 */
public interface EmailService {

    /**
     * Sends a standard e-mail containing data from an EmailRequest.
     *
     * @param request the e-mail request containing recipient details and message content
     */
    void sendEmail(EmailRequest request);

    /**
     * Sends a confirmation e-mail to the specified user in the appropriate language.
     * The e-mail template is selected based on the provided language parameter.
     *
     * @param userEmail the recipient's e-mail address
     * @param language  the language preference ("pl" for Polish, defaults to English)
     * @throws MessagingException if an error occurs while creating or sending the e-mail
     */
    void sendConfirmationEmail(String userEmail, String language) throws MessagingException;

    /**
     * Sends a password reset email to the specified user in the appropriate language.
     * The e-mail template is selected based on the provided language parameter.
     *
     * @param userEmail the recipient's email address
     * @param request   the HTTP request containing additional context (such as IP address) for the password reset operation
     * @param language  the language preference ("pl" for Polish, defaults to English)
     * @throws MessagingException if an error occurs while creating or sending the email
     */
    void sendResetPasswordEmail(String userEmail, HttpServletRequest request, String language) throws MessagingException;

    /**
     * Sends an account activation email to the specified user in the appropriate language.
     * The e-mail template is selected based on the provided language parameter.
     *
     * @param username  the recipient's username
     * @param userEmail the recipient's email address
     * @param language  the language preference ("pl" for Polish, defaults to English)
     * @throws MessagingException if an error occurs while creating or sending the email
     */
    void sendAccountActivationEmail(String username, String userEmail, String language) throws MessagingException;
}
