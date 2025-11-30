package org.example.codenames.email.controller.impl;

import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import org.example.codenames.email.controller.api.EmailController;
import org.example.codenames.email.entity.EmailRequest;
import org.example.codenames.email.service.api.EmailService;
import org.example.codenames.user.repository.api.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;


@RestController
@RequestMapping("/api/email")
public class DefaultEmailController implements EmailController {

    private final EmailService emailService;
    private final UserRepository userRepository;

    @Autowired
    public DefaultEmailController(EmailService emailService, UserRepository userRepository) {
        this.emailService = emailService;
        this.userRepository = userRepository;
    }

    @PostMapping("/send-report")
    public ResponseEntity<String> sendEmail(@RequestBody EmailRequest request, String language) throws MessagingException, IOException {
        emailService.sendEmail(request);
        emailService.sendConfirmationEmail(request.getEmail(), language);

        return ResponseEntity.ok("");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> sendResetPasswordEmail(@RequestBody EmailRequest request, HttpServletRequest httpServletRequest, String language) throws MessagingException, IOException {
        if (userRepository.findByEmail(request.getEmail()).isEmpty()) return ResponseEntity.notFound().build();

        emailService.sendResetPasswordEmail(request.getEmail(), httpServletRequest, language);

        return ResponseEntity.ok("");
    }
}
