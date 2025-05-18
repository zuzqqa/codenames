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

        // Test record
        String[] cards = new String[3];
        cards[0] = "cardA";
        cards[1] = "cardB";
        cards[2] = "cardC";
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
                "testName",
                8,
                "abcd",
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

        assertDoesNotThrow(() -> gameSessionMap.get(newGame.getSessionId().toString()));
        GameSession retrievedGame = gameSessionMap.get(newGame.getSessionId().toString());
        GameState retrievedGameState = retrievedGame.getGameState();
        assertEquals(retrievedGame.getGameName(), newGame.getGameName());
        assertEquals(retrievedGame.getMaxPlayers(), newGame.getMaxPlayers());
        assertEquals(retrievedGame.getStatus(), newGame.getStatus());
        assertEquals(retrievedGame.getPassword(), newGame.getPassword());
        assertEquals(retrievedGameState.getCards()[0], newGame.getGameState().getCards()[0]);
        assertEquals(retrievedGameState.getCards()[1], newGame.getGameState().getCards()[1]);
        assertEquals(retrievedGameState.getCards()[2], newGame.getGameState().getCards()[2]);
        assertEquals(retrievedGameState.getCardsColors()[0], newGame.getGameState().getCardsColors()[0]);
        assertEquals(retrievedGameState.getCardsColors()[1], newGame.getGameState().getCardsColors()[1]);
        assertEquals(retrievedGameState.getCardsColors()[2], newGame.getGameState().getCardsColors()[2]);


    }

    @Test
    public void testAddingUsersToGameSession() {
        String sessionId = gameSessionMap.keySet().iterator().next();
        GameSession gameSession = gameSessionMap.get(sessionId);

        // Create a test user
        User testUser = User.builder()
                .username("testUser")
                .password("testPassword")
                .id(UUID.randomUUID().toString())
                .roles("ROLE_USER")
                .isGuest(false)
                .status(User.userStatus.ACTIVE)
                .build();

        // Add the user to the first team in the connected users list
        gameSession.getConnectedUsers().get(0).add(testUser);

        // Assert that the user was added successfully
        assertEquals(1, gameSession.getConnectedUsers().get(0).size());
        assertEquals("testUser", gameSession.getConnectedUsers().get(0).get(0).getUsername());
    }
}
