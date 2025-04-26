package org.example.codenames.email.controller.api;

import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import org.example.codenames.email.entity.EmailRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;

import java.io.IOException;

/**
 * Email controller interface.
 */
public interface EmailController {
    ResponseEntity<String> sendEmail(@RequestBody EmailRequest request, String language) throws MessagingException, IOException;

    ResponseEntity<String> sendResetPasswordEmail(@RequestBody EmailRequest request, HttpServletRequest httpServletRequest, String language) throws MessagingException, IOException;
}
