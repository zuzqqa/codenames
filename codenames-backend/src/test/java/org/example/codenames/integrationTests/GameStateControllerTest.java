package org.example.codenames.integrationTests;

import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.repository.api.GameSessionRepository;
import org.example.codenames.gameState.entity.GameState;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class GameStateControllerTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private GameSessionRepository sessionRepository;

    @BeforeEach
    void clean() {
        sessionRepository.deleteAll();
    }

    @Test
    public void getCardsByGameSession_returnsCards() throws Exception {
        GameState gs = new GameState();
        gs.setCards(new String[]{"a","b"});
        gs.setCardsColors(new Integer[]{1, 2});
        gs.setCardsVotes(new java.util.ArrayList<>());
        gs.setCardsChosen(new java.util.ArrayList<>());
        gs.setBlueTeamScore(0);
        gs.setRedTeamScore(0);
        gs.setTeamTurn(0);
        gs.setHintNumber(0);
        gs.setInitialHintNumber("0");
        gs.setHintTurn(true);
        gs.setGuessingTurn(false);

        GameSession session = GameSession.builder()
                .sessionId(UUID.randomUUID())
                .status(GameSession.sessionStatus.CREATED)
                .gameName("Test Game")
                .maxPlayers(4)
                .password("")
                .connectedUsers(new java.util.ArrayList<>())
                .votes(new java.util.ArrayList<>())
                .gameState(gs)
                .build();

        sessionRepository.save(session);

        mvc.perform(get("/api/game-state/" + session.getSessionId() + "/get-cards")
                        .param("language", "en")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
}
