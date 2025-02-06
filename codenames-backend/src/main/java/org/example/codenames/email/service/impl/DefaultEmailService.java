package org.example.codenames.email.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.example.codenames.email.entity.EmailRequest;
import org.example.codenames.email.service.api.EmailService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

@Service
public class DefaultEmailService implements EmailService {
    private final JavaMailSender mailSender;

    @Autowired
    public DefaultEmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(EmailRequest request) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo("codenames.contact@gmail.com");
        mailMessage.setSubject("Codenames Contact Form");
        mailMessage.setText(request.getEmail() + "\n" + request.getDataToSend());
        mailSender.send(mailMessage);
    }

    public void sendConfirmationEmail(String userEmail, String language) throws MessagingException, IOException {
        ClassPathResource resource;

        if ("pl".equals(language)) {
            resource = new ClassPathResource("mail-templates/message_received_templates/message_received_pl.html");
        }
        else {
            resource = new ClassPathResource("mail-templates/message_received_templates/message_received_en.html");
        }

        String htmlContent = new String(Files.readAllBytes(resource.getFile().toPath()), StandardCharsets.UTF_8);

        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

        helper.setTo(userEmail);
        helper.setSubject("Confirmation Email");
        helper.setText(htmlContent, true);

        mailSender.send(mimeMessage);
    }
}
