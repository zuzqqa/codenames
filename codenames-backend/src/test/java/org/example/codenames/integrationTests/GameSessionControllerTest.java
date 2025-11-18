package org.example.codenames.integrationTests;

import lombok.extern.slf4j.Slf4j;
import org.example.codenames.CodenamesApplication;
import org.example.codenames.gameSession.controller.api.GameSessionController;
import org.example.codenames.gameSession.repository.api.GameSessionRepository;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;

import org.springframework.http.MediaType;

import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.testcontainers.shaded.com.fasterxml.jackson.databind.ObjectMapper;

import java.util.UUID;

/**
 * Integration tests for the game session functionalities.
 * Primarily testing {@link GameSessionController} endpoints.
 *
 * This class reuses the shared Testcontainers setup from {@link AbstractIntegrationTest}
 * to ensure the MongoDB container is started before Spring's ApplicationContext loads.
 */
@Slf4j
@SpringBootTest(classes = CodenamesApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(locations="classpath:application-test.properties")
@Timeout(60) // 60 second timeout for all tests to prevent infinite hanging
public class GameSessionControllerTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    GameSessionRepository gameSessionRepository;

    @BeforeEach
    void setUp() {
        log.info("=== Starting test setup ===");
    }

    // Cleaning the database after each test for isolation.
    @AfterEach
    void cleanDatabase() {
        log.info("=== Cleaning database ===");
        gameSessionRepository.deleteAll();
        log.info("=== Database cleaned ===");
    }


    @Test
    void shouldCreateGame() throws Exception {
        log.info("=== TEST: shouldCreateGame - START ===");
        // valid request body
        String requestBody = """
                {
                    "gameName": "game1",
                    "maxPlayers": 4,
                    "password": "",
                    "language": "en"
                }
                """;

        log.info("Performing POST request to create game");
        mvc.perform(post("/api/game-session/create-game")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk());
        log.info("=== TEST: shouldCreateGame - END ===");
    }

    @Test
    void shouldNotGetGameSession() throws Exception {
        log.info("=== TEST: shouldNotGetGameSession - START ===");
        UUID id = UUID.randomUUID();
        log.info("Performing GET request with non-existent ID: {}", id);
        mvc.perform(get("/api/game-session/" + id))
                .andExpect(status().isNotFound());
        log.info("=== TEST: shouldNotGetGameSession - END ===");
    }

    @Test
    void shouldGetGameSession() throws Exception {
        log.info("=== TEST: shouldGetGameSession - START ===");
        String requestBody = """
                {
                    "gameName": "exampleGame",
                    "maxPlayers": 8,
                    "password": "",
                    "language": "en"
                }
                """;

        log.info("Creating game session");
        MvcResult result = mvc.perform(post("/api/game-session/create-game")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andReturn();

        log.info("Parsing game ID from response");
        String id = new ObjectMapper().readTree(result.getResponse().getContentAsString()).get("gameId").asText();
        log.info("Game ID: {}", id);

        log.info("Retrieving game session");
        mvc.perform(get("/api/game-session/" + id))
                .andExpect(status().isOk());
        log.info("=== TEST: shouldGetGameSession - END ===");
    }

    @Test
    void shouldSubmitVote() throws Exception {
        log.info("=== TEST: shouldSubmitVote - START ===");
        // Create a game session first
        String requestBody = """
            {
                "gameName": "voteGame",
                "maxPlayers": 4,
                "password": "",
                "language": "en"
            }
            """;

        log.info("Creating game session for vote test");
        MvcResult result = mvc.perform(post("/api/game-session/create-game")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andReturn();

        log.info("Parsing game ID");
        String gameId = new ObjectMapper().readTree(result.getResponse().getContentAsString()).get("gameId").asText();
        log.info("Game ID: {}", gameId);

        String voteRequest = """
            {
                "userId": "user123",
                "votedUserId": "user456"
            }
            """;

        log.info("Submitting vote");
        mvc.perform(post("/api/game-session/" + gameId + "/vote")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(voteRequest))
                .andExpect(status().isOk());
        log.info("=== TEST: shouldSubmitVote - END ===");
    }

    @Test
    void shouldConnectPlayer() throws Exception {
        log.info("=== TEST: shouldConnectPlayer - START ===");
        String requestBody = """
            {
                "gameName": "connectGame",
                "maxPlayers": 4,
                "password": "",
                "language": "en"
            }
            """;

        log.info("Creating game session for connect test");
        MvcResult result = mvc.perform(post("/api/game-session/create-game")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andReturn();

        log.info("Parsing game ID");
        String gameId = new ObjectMapper().readTree(result.getResponse().getContentAsString()).get("gameId").asText();
        log.info("Game ID: {}", gameId);

        log.info("Connecting player");
        mvc.perform(post("/api/game-session/" + gameId + "/connect")
                        .param("userId", "1")
                        .param("teamIndex", "1"))
                .andDo(print())
                .andExpect(status().isOk());
        log.info("=== TEST: shouldConnectPlayer - END ===");
    }

    @Test
    void shouldDisconnectPlayer() throws Exception {
        log.info("=== TEST: shouldDisconnectPlayer - START ===");
        String requestBody = """
            {
                "gameName": "disconnectGame",
                "maxPlayers": 4,
                "password": "",
                "language": "en"
            }
            """;

        log.info("Creating game session for disconnect test");
        MvcResult result = mvc.perform(post("/api/game-session/create-game")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andReturn();

        log.info("Parsing game ID");
        String gameId = new ObjectMapper().readTree(result.getResponse().getContentAsString()).get("gameId").asText();
        log.info("Game ID: {}", gameId);

        // Connect first
        log.info("Connecting player first");
        mvc.perform(post("/api/game-session/" + gameId + "/connect")
                        .param("userId", "1")
                        .param("teamIndex", "1"))
                .andExpect(status().isOk());

        // Now disconnect
        log.info("Disconnecting player");
        mvc.perform(delete("/api/game-session/" + gameId + "/disconnect")
                        .param("userId", "1"))
                .andExpect(status().isOk());
        log.info("=== TEST: shouldDisconnectPlayer - END ===");
    }
}