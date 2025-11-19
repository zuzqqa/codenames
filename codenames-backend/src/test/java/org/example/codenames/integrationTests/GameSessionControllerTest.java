package org.example.codenames.integrationTests;

import com.hazelcast.core.Hazelcast;
import org.example.codenames.CodenamesApplication;
import org.example.codenames.gameSession.controller.api.GameSessionController;
import org.example.codenames.gameSession.repository.api.GameSessionRepository;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
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
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for the game session functionalities.
 * Primarily testing {@link GameSessionController} endpoints.
 */
@Testcontainers
@SpringBootTest(classes = CodenamesApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(locations = "classpath:application-test.properties")
public class GameSessionControllerTest {

    // MongoDB Testcontainers container.
    public static MongoDBContainer mongo = new MongoDBContainer(DockerImageName.parse("mongo:5"))
            .withExposedPorts(27017)
            .waitingFor(Wait.forLogMessage(".*Waiting for connections.*", 1))
            .withStartupTimeout(Duration.ofSeconds(60));
    @Autowired
    GameSessionRepository gameSessionRepository;
    @Autowired
    private MockMvc mvc;

    // Setting up the MongoDB connection properties (dynamic application.properties).
    @DynamicPropertySource
    static void mongoProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.mongodb.uri",
                () -> "mongodb://" + mongo.getHost() + ":" + mongo.getMappedPort(27017) + "/CodenamesDB");
        // Secret for token generation.
    }

    // Starting the MongoDB container before all tests.
    @BeforeAll
    static void startup() {
        mongo.start();
    }

    @AfterAll
    static void shutdown() {
        Hazelcast.shutdownAll();
    }

    // Cleaning the database after each test for isolation.
    @AfterEach
    void cleanDatabase() {
        gameSessionRepository.deleteAll();
    }

    @Test
    void shouldCreateGame() throws Exception {
        // valid request body
        String requestBody = """
                {
                    "gameName": "game1",
                    "maxPlayers": 4,
                    "password": "",
                    "language": "en"
                }
                """;

        mvc.perform(post("/api/game-session/create-game")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk());
    }

    @Test
    void shouldNotGetGameSession() throws Exception {
        UUID id = UUID.randomUUID();
        mvc.perform(get("/api/game-session/" + id))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldGetGameSession() throws Exception {
        String requestBody = """
                {
                    "gameName": "exampleGame",
                    "maxPlayers": 8,
                    "password": "",
                    "language": "en"
                }
                """;

        MvcResult result = mvc.perform(post("/api/game-session/create-game")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andReturn();
        String id = new ObjectMapper().readTree(result.getResponse().getContentAsString()).get("gameId").asText();
        mvc.perform(get("/api/game-session/" + id))
                .andExpect(status().isOk());
    }

    @Test
    void shouldSubmitVote() throws Exception {
        // Create a game session first
        String requestBody = """
                {
                    "gameName": "voteGame",
                    "maxPlayers": 4,
                    "password": "",
                    "language": "en"
                }
                """;

        MvcResult result = mvc.perform(post("/api/game-session/create-game")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andReturn();

        String gameId = new ObjectMapper().readTree(result.getResponse().getContentAsString()).get("gameId").asText();

        String voteRequest = """
                {
                    "userId": "user123",
                    "votedUserId": "user456"
                }
                """;

        mvc.perform(post("/api/game-session/" + gameId + "/vote")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(voteRequest))
                .andExpect(status().isOk());
    }

    @Test
    void shouldConnectPlayer() throws Exception {
        String requestBody = """
                {
                    "gameName": "connectGame",
                    "maxPlayers": 4,
                    "password": "",
                    "language": "en"
                }
                """;

        MvcResult result = mvc.perform(post("/api/game-session/create-game")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andReturn();

        String gameId = new ObjectMapper().readTree(result.getResponse().getContentAsString()).get("gameId").asText();

        mvc.perform(post("/api/game-session/" + gameId + "/connect")
                        .param("userId", "1")
                        .param("teamIndex", "1"))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    void shouldDisconnectPlayer() throws Exception {
        String requestBody = """
                {
                    "gameName": "disconnectGame",
                    "maxPlayers": 4,
                    "password": "",
                    "language": "en"
                }
                """;

        MvcResult result = mvc.perform(post("/api/game-session/create-game")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andReturn();

        String gameId = new ObjectMapper().readTree(result.getResponse().getContentAsString()).get("gameId").asText();

        // Connect first
        mvc.perform(post("/api/game-session/" + gameId + "/connect")
                        .param("userId", "1")
                        .param("teamIndex", "1"))
                .andExpect(status().isOk());

        // Now disconnect
        mvc.perform(delete("/api/game-session/" + gameId + "/disconnect")
                        .param("userId", "1"))
                .andExpect(status().isOk());
    }
}