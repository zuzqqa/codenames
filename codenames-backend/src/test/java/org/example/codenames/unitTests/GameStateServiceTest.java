package org.example.codenames.unitTests;

import org.example.codenames.card.entity.Card;
import org.example.codenames.card.repository.CardRepository;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.repository.api.GameSessionRepository;
import org.example.codenames.gameState.entity.GameState;
import org.example.codenames.gameState.service.impl.DefaultGameStateService;
import org.example.codenames.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DefaultGameStateServiceTest {

    @Mock
    private CardRepository cardRepository;

    @Mock
    private GameSessionRepository gameSessionRepository;

    @InjectMocks
    private DefaultGameStateService gameStateService;

//    @BeforeEach
//    void setUp() {
//        gameStateService.cardsTotal = 25;
//        gameStateService.cardsRed = 6;
//        gameStateService.cardsBlue = 6;
//    }

    @Test
    void generateRandomCardsNames_ShouldSelect25UniqueCards() {
        List<Card> mockCards = IntStream.range(0, 100)
                .mapToObj(i -> new Card("Card" + i, Map.of("en", "CardName" + i)))
                .collect(Collectors.toList());

        when(cardRepository.findAll()).thenReturn(mockCards);

        GameState gameState = new GameState();
        gameStateService.generateRandomCardsNames(gameState, "en");

        assertNotNull(gameState.getCards());
        assertEquals(25, gameState.getCards().length);
        assertEquals(25, new HashSet<>(Arrays.asList(gameState.getCards())).size(), "Cards should be unique");
    }

    @Test
    void generateRandomCardsColors_ShouldAssignCorrectDistribution() {
        GameState gameState = new GameState();
        gameStateService.generateRandomCardsColors(gameState);

        assertNotNull(gameState.getCardsColors());
        assertEquals(25, gameState.getCardsColors().length);

        long redCount = Arrays.stream(gameState.getCardsColors()).filter(c -> c == 1).count();
        long blueCount = Arrays.stream(gameState.getCardsColors()).filter(c -> c == 2).count();
        long assassinCount = Arrays.stream(gameState.getCardsColors()).filter(c -> c == 3).count();
        long neutralCount = Arrays.stream(gameState.getCardsColors()).filter(c -> c == 0).count();

        assertEquals(5, redCount);
        assertEquals(6, blueCount);
        assertEquals(1, assassinCount);
        assertEquals(13, neutralCount);
    }

    @Test
    void updateVotes_ShouldIncreaseVoteCountForSelectedCards() {
        UUID sessionId = UUID.randomUUID();
        GameSession gameSession = new GameSession();
        GameState gameState = new GameState();
        gameState.setCardsVotes(new ArrayList<>(Collections.nCopies(25, 0)));
        gameSession.setGameState(gameState);

        when(gameSessionRepository.findBySessionId(sessionId)).thenReturn(Optional.of(gameSession));

        List<Integer> selectedCards = List.of(1, 2, 3);
        gameStateService.updateVotes(sessionId, selectedCards);

        assertEquals(1, gameState.getCardsVotes().get(1));
        assertEquals(1, gameState.getCardsVotes().get(2));
        assertEquals(1, gameState.getCardsVotes().get(3));
        verify(gameSessionRepository, times(1)).save(gameSession);
    }

    @Test
    void updateVotes_ShouldThrowExceptionForInvalidCardIndex() {
        UUID sessionId = UUID.randomUUID();
        GameSession gameSession = new GameSession();
        GameState gameState = new GameState();
        gameState.setCardsVotes(new ArrayList<>(Collections.nCopies(25, 0)));
        gameSession.setGameState(gameState);

        when(gameSessionRepository.findBySessionId(sessionId)).thenReturn(Optional.of(gameSession));

        List<Integer> invalidCards = List.of(30);

        assertThrows(IllegalArgumentException.class, () -> gameStateService.updateVotes(sessionId, invalidCards));
    }

    @Test
    void cardsChoosenShouldUpdateChosenCardsAndScores() {
        GameSession gameSession = new GameSession();
        GameState gameState = new GameState();
        gameState.setCardsVotes(Arrays.asList(2, 2, 1, 1, 0));
        gameState.setCardsColors(new Integer[]{1, 2, 0, 3, 1});
        gameState.setCardsChoosen(new ArrayList<>());
        gameState.setRedTeamScore(0);
        gameState.setBlueTeamScore(0);
        gameState.setTeamTurn(1);
        gameSession.setGameState(gameState);
        gameSession.setConnectedUsers((List<List<User>>) Map.of(1, List.of("User1", "User2")));

        gameStateService.cardsChoosen(gameSession);

        assertEquals(List.of(0, 1), gameState.getCardsChoosen());
        assertEquals(1, gameState.getRedTeamScore());
        assertEquals(1, gameState.getBlueTeamScore());
        assertEquals(100, gameState.getBlueTeamScore(), "Assassin should end the game");
        verify(gameSessionRepository, times(1)).save(gameSession);
    }
}
