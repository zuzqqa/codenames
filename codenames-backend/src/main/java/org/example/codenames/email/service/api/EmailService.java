package org.example.codenames.email.service.api;
import org.springframework.stereotype.Service;

@Service
public interface EmailService {
    public void sendEmail(String body);
}
