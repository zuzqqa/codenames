package org.example.codenames.email.controller.api;

import jakarta.mail.MessagingException;
import org.example.codenames.email.entity.EmailRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;

import java.io.IOException;

public interface EmailController {

    ResponseEntity<String> sendEmail(@RequestBody EmailRequest request, String language) throws MessagingException, IOException;

    public ResponseEntity<String> sendResetPasswordEmail(@RequestBody EmailRequest request, String language) throws MessagingException, IOException;
}
