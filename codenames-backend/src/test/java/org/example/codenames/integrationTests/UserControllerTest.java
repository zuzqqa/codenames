package org.example.codenames.integrationTests;

import jakarta.servlet.http.Cookie;
import org.example.codenames.CodenamesApplication;
import org.example.codenames.user.controller.api.UserController;
import org.example.codenames.user.entity.User;
import org.example.codenames.user.repository.api.UserRepository;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.shaded.com.fasterxml.jackson.databind.ObjectMapper;
import org.testcontainers.utility.DockerImageName;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for the client controller/service functionalities.
 * Primarily testing {@link UserController} endpoints.
 */

@Testcontainers
@SpringBootTest(classes = CodenamesApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(locations="classpath:application-test.properties")
public class UserControllerTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MockMvc mvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // MongoDB Testcontainers container.
    public static MongoDBContainer mongo = new MongoDBContainer(DockerImageName.parse("mongo:5"))
            .withExposedPorts(27017)
            .waitingFor(Wait.forLogMessage(".*Waiting for connections.*", 1))
            .withStartupTimeout(Duration.ofSeconds(60));

    // Setting up the MongoDB connection properties (dynamic application.properties).
    @DynamicPropertySource
    static void mongoProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.mongodb.uri",
                () -> "mongodb://" + mongo.getHost() + ":" + mongo.getMappedPort(27017) + "/CodenamesDB");
        // Secret for token generation.
    }

    // Starting the MongoDB container before all tests.
    @BeforeAll
    static void setup() {
        mongo.start();
    }

    // Cleaning the database before each test for isolation of tests.
    @BeforeEach
    void cleanDatabase() {
        userRepository.deleteAll();
    }

    // Testing the preflight request.
    @Test
    public void shouldAllowPreflight() throws Exception {
        mvc.perform(options("/api/users")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk());
    }

    // Testing the creation of a new user via endpoint POST /api/users.
    @Test
    public void shouldAddUser() throws Exception {
        User user = User.builder()
                .username("test")
                .password("Test1234?")
                .email("example@gmail.com")
                .build();

        mvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Origin", "http://localhost:5173")  // Set the origin
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
        User user = User.builder()
                .username("test")
                .password("Test1234?")
                .email("example@gmail.com")
                .build();

        mvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Origin", "http://localhost:5173")
                        .param("language", "en")
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk());

        mvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Origin", "http://localhost:5173")
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
                        .header("Origin", "http://localhost:5173")
                        .param("language", "en")
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isBadRequest());
    }

    // Testing the retrieval of the username by token via endpoint GET /api/users/username/{token}.
    @Test
    public void shouldGetUsernameByToken() throws Exception {
        User user = User.builder()
                .username("test")
                .password("test")
                .email("example@gmail.com")
                .roles("ROLE_GUEST")
                .isGuest(true)
                .build();

        MvcResult result = mvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Origin", "http://localhost:5173")
                        .param("language", "en")
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk())
                .andReturn();

        Cookie authTokenCookie = result.getResponse().getCookie("authToken");
        assertNotNull(authTokenCookie, "authToken cookie should not be null");
        String token = authTokenCookie.getValue();

        result = mvc.perform(get("/api/users/username/" + token)
                        .header("Origin", "http://localhost:5173")
                        .cookie(new Cookie("authToken", token)))
                .andExpect(status().isOk())
                .andReturn();

        String jsonResponse = result.getResponse().getContentAsString();
        String username = objectMapper.readTree(jsonResponse).get("username").asText();

        assertEquals("test", username);
    }

    /**
     * Testing the retrieval of all users via endpoint GET /api/users.
     * Expected behavior:
     * Only admin users can retrieve all users.
     * User gets forbidden response.
     */
    @Test
    public void shouldReturnAllUsers() throws Exception {
        User user = User.builder()
                .username("test")
                .password("test")
                .email("example@gmail.com")
                .roles("ROLE_GUEST")
                .isGuest(true)
                .build();

        MvcResult result = mvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Origin", "http://localhost:5173")
                        .param("language", "en")
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk()).andReturn();

        String token = result.getResponse().getCookie("authToken").getValue();

        mvc.perform(get("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Origin", "http://localhost:5173")
                        .param("language", "en")
                        .cookie(new Cookie("authToken", token))
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isForbidden());

        User adminUser = User.builder()
                .username("important_admin")
                .password("admin")
                .email("imadmin@gmail.com")
                .roles("ROLE_ADMIN")
                .build();

        result = mvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Origin", "http://localhost:5173")
                        .param("language", "en")
                        .content(objectMapper.writeValueAsString(adminUser)))
                .andExpect(status().isOk()).andReturn();

        token = result.getResponse().getCookie("authToken").getValue();

        mvc.perform(get("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Origin", "http://localhost:5173")
                        .param("language", "en")
                        .cookie(new Cookie("authToken", token))
                        .content(objectMapper.writeValueAsString(adminUser)))
                .andExpect(status().isOk());
    }
}
