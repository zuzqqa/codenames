package org.example.codenames.integrationTests;

import org.example.codenames.user.controller.api.UserController;
import org.example.codenames.user.entity.User;
import org.example.codenames.user.repository.api.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.shaded.com.fasterxml.jackson.databind.ObjectMapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for the client controller/service functionalities.
 * Primarily testing {@link UserController} endpoints.
 *
 * This class reuses the shared Testcontainers setup from {@link AbstractIntegrationTest}
 */
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(locations = "classpath:application-test.properties")
public class UserControllerTest extends AbstractIntegrationTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MockMvc mvc;

    // Cleaning the database before each test for isolation of tests.
    @BeforeEach
    void cleanDatabase() {
        userRepository.deleteAll();
    }

    // Testing the preflight request.
    @Test
    public void shouldAllowPreflight() throws Exception {
        mvc.perform(options("/api/users")
                        .header("Origin", frontendUrl)
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk());
    }

    // Testing the creation of a new user via endpoint POST /api/users.
    @Test
    public void shouldAddUser() throws Exception {
        doNothing().when(emailService).sendAccountActivationEmail("test", "example@gmail.com", "en");
        User user = User.builder()
                .username("test")
                .password("Test1234?")
                .email("example@gmail.com")
                .build();

        mvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Origin", frontendUrl)  // Set the origin
                        .param("language", "en")
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk());

        User savedUser = userRepository.findByUsername("test").orElse(null);
        assertNotNull(savedUser);
        assertEquals(user.getUsername(), savedUser.getUsername());
        assertEquals(user.getEmail(), savedUser.getEmail());
    }

    // Testing the creation of a new user with an already existing username via endpoint POST /api/users.
    @Test
    public void addAlreadyExistingUser() throws Exception {
        doNothing().when(emailService).sendAccountActivationEmail("test", "example@gmail.com", "en");
        User user = User.builder()
                .username("test")
                .password("Test1234?")
                .email("example@gmail.com")
                .status(User.userStatus.ACTIVE)
                .build();

        mvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Origin", frontendUrl)
                        .param("language", "en")
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk());

        mvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Origin", frontendUrl)
                        .param("language", "en")
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isBadRequest());
    }

    // Testing the creation of a new user with empty data via endpoint POST /api/users.
    @Test
    public void addUserWithEmptyData() throws Exception {
        User user = User.builder()
                .username("someone")
                .password("strongPassword")
                .build();

        mvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Origin", frontendUrl)
                        .param("language", "en")
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isBadRequest());
    }
}
