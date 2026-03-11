package org.example.codenames.integrationTests;

import org.example.codenames.email.entity.MessagePayload;
import org.example.codenames.user.entity.User;
import org.example.codenames.user.repository.api.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.shaded.com.fasterxml.jackson.databind.ObjectMapper;

import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class EmailControllerTest extends AbstractIntegrationTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private MockMvc mvc;

    @Autowired
    private UserRepository userRepository;


    @BeforeEach
    void clean() {
        userRepository.deleteAll();
    }

    @Test
    public void sendReport_callsEmailService() throws Exception {
        MessagePayload req = new MessagePayload();
        req.setEmailAddress("a@b.c");
        req.setMessage("hello");

        doNothing().when(emailService).sendEmail(org.mockito.ArgumentMatchers.any(MessagePayload.class));
        doNothing().when(emailService).sendConfirmationEmail(org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.any());

        mvc.perform(post("/api/email/send-report")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        verify(emailService).sendEmail(org.mockito.ArgumentMatchers.any(MessagePayload.class));
        verify(emailService).sendConfirmationEmail(org.mockito.ArgumentMatchers.eq("a@b.c"), org.mockito.ArgumentMatchers.isNull());
    }

    @Test
    public void resetPassword_userExists_sendsEmail() throws Exception {
        User u = User.builder().username("u1").email("u1@x.com").password("p").build();
        userRepository.save(u);

        MessagePayload req = new MessagePayload();
        req.setEmailAddress(u.getEmail());

        mvc.perform(post("/api/email/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        verify(emailService).sendResetPasswordEmail(org.mockito.ArgumentMatchers.eq(req.getEmailAddress()), org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.isNull());
    }

    @Test
    public void resetPassword_userNotFound_returnsNotFound() throws Exception {
        MessagePayload req = new MessagePayload();
        req.setEmailAddress("missing@x.com");

        mvc.perform(post("/api/email/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound());
    }
}
