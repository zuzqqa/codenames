package org.example.codenames.email.controller.api;

import org.example.codenames.email.entity.EmailRequest;
import org.springframework.http.ResponseEntity;

public interface EmailController {
    public ResponseEntity<String> sendEmail(EmailRequest request);
}
