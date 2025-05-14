package org.example.codenames.unitTests.alfaTests;

import com.hazelcast.config.Config;
import com.hazelcast.core.Hazelcast;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameState.entity.GameState;
import org.example.codenames.hazelcast.HazelcastConfiguration;
import org.example.codenames.user.entity.User;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.*;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class HazelcastTest {

    private HazelcastInstance hazelcastInstance;
    private IMap<String, GameSession> gameSessionMap;

    @BeforeEach
    public void setUp() {
        HazelcastConfiguration hazelcastConfig = new HazelcastConfiguration();
        hazelcastInstance = hazelcastConfig.hazelcastInstance();
        gameSessionMap = hazelcastInstance.getMap("gameSessions");
    }

    @AfterEach
    public void tearDown() {
        gameSessionMap.clear();
        hazelcastInstance.shutdown();
    }

    @Test
    public void testEmptyGameSessionSerialization() {
        String[] cards = new String[3];
        cards[0] = "card1";
        cards[1] = "card2";
        cards[2] = "card3";
        Integer[] cardsTypes = new Integer[3];
        cardsTypes[0] = 1;
        cardsTypes[1] = 2;
        cardsTypes[2] = 3;
        GameState gameState = new GameState();
        gameState.setCards(cards);
        gameState.setCardsColors(cardsTypes);
        gameState.setTeamTurn(0);
        gameState.setBlueTeamScore(0);
        gameState.setRedTeamScore(0);

        List<Integer> cardsVotes = new ArrayList<>(Collections.nCopies(gameState.getCards().length, 0));

        gameState.setCardsVotes(cardsVotes);

        GameSession newGame = new GameSession(
                GameSession.sessionStatus.CREATED,
                UUID.randomUUID(),
                "randomName",
                4,
                "",
                new ArrayList<>() {{
                    add(new ArrayList<>());
                    add(new ArrayList<>());
                }},
                new ArrayList<>() {{
                    add(new ArrayList<>());
                    add(new ArrayList<>());
                }},
                gameState,
                System.currentTimeMillis()
        );

        gameSessionMap.put(newGame.getSessionId().toString(), newGame);
        // Assert that the original and retrieved objects are equal
        assertDoesNotThrow(() -> gameSessionMap.get(newGame.getSessionId().toString()));
        GameSession retrievedGame = gameSessionMap.get(newGame.getSessionId().toString());
        System.out.println("Retrieved Game Session: " + retrievedGame.getGameName());
        System.out.println("Retrieved Game session max players: " + retrievedGame.getMaxPlayers());
        System.out.println("Retrieved Game session status: " + retrievedGame.getStatus());
        System.out.println("Retrieved Game session password: " + retrievedGame.getPassword());
        System.out.println("Retrieved Game session voting start time: " + retrievedGame.getVotingStartTime());
        System.out.println("Retrieved Game session connected users: " + retrievedGame.getConnectedUsers());
        assertEquals(retrievedGame.getGameName(), newGame.getGameName());
        assertEquals(retrievedGame.getMaxPlayers(), newGame.getMaxPlayers());
        assertEquals(retrievedGame.getStatus(), newGame.getStatus());
        assertEquals(retrievedGame.getPassword(), newGame.getPassword());
    }
}
