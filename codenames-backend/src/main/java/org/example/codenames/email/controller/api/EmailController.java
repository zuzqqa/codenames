package org.example.codenames.email.controller.api;

import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import org.example.codenames.email.entity.EmailRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;

import java.io.IOException;

/**
 * Default implementation of the EmailController interface.
 * Provides functionality to send emails.
 */
public interface EmailController {

    /**
     * Sends a confirmation email to the specified e-mail address in the specified language.
     *
     * @param request  the e-mail request containing recipient details and message content
     * @param language the language preference ("pl" for Polish, defaults to English)
     * @return a ResponseEntity with an empty body and an OK status
     * @throws MessagingException if an error occurs while sending the email
     * @throws IOException        if an error occurs while reading the email template file
     */
    ResponseEntity<String> sendEmail(@RequestBody EmailRequest request, String language) throws MessagingException, IOException;

    /**
     * Sends a password reset to the specified e-mail address in the specified language.
     *
     * @param request            the e-mail request containing recipient details and message content
     * @param httpServletRequest the HTTP request containing additional context (such as IP address) for the password reset operation
     * @param language           the language preference ("pl" for Polish, defaults to English)
     * @return a ResponseEntity with an empty body and an OK status or notFound status if the is no user found with corresponding e-mail address
     * @throws MessagingException if an error occurs while sending the email
     * @throws IOException        if an error occurs while reading the email template file
     */
    ResponseEntity<String> sendResetPasswordEmail(@RequestBody EmailRequest request, HttpServletRequest httpServletRequest, String language) throws MessagingException, IOException;
}
