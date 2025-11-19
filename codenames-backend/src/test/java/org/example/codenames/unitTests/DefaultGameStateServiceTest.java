package org.example.codenames.unitTests;

import org.example.codenames.card.entity.Card;
import org.example.codenames.gameState.entity.CardsVoteRequest;
import org.example.codenames.gameState.entity.GameState;
import org.example.codenames.gameState.service.impl.DefaultGameStateService;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.repository.api.GameSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DefaultGameStateServiceTest {

    @Mock
    GameSessionRepository gameSessionRepository;

    @InjectMocks
    DefaultGameStateService service;

    @BeforeEach
    void init() throws Exception {
        // The service normally gets these values injected by Spring (@Value).
        // In unit tests we must set them manually via reflection so methods are deterministic.
        Field cardsTotal = DefaultGameStateService.class.getDeclaredField("cardsTotal");
        cardsTotal.setAccessible(true);
        cardsTotal.setInt(service, 25);

        Field cardsRed = DefaultGameStateService.class.getDeclaredField("cardsRed");
        cardsRed.setAccessible(true);
        cardsRed.setInt(service, 9);

        Field cardsBlue = DefaultGameStateService.class.getDeclaredField("cardsBlue");
        cardsBlue.setAccessible(true);
        cardsBlue.setInt(service, 8);
    }

    @Test
    void getCardNameInLanguage_returnsCorrect() {
        Card c = new Card();
        c.setId("cardId");
        c.setNames(Map.of("en", "Apple"));

        assertEquals("cardId", service.getCardNameInLanguage(c, "pl"));
        assertEquals("Apple", service.getCardNameInLanguage(c, "en"));
        assertEquals("cardId", service.getCardNameInLanguage(c, "fr"));
    }

    @Test
    void generateRandomCardsColors_assignsCorrectLength() {
        GameState gs = new GameState();
        service.generateRandomCardsColors(gs);
        assertNotNull(gs.getCardsColors());

        Integer[] colors = gs.getCardsColors();
        // length should be at least 1 (assassin added) and at most 25 (expected cardsTotal)
        assertTrue(colors.length >= 1 && colors.length <= 25, "unexpected cards colors length: " + colors.length);

        // exactly one assassin (value 3) must be present
        long assassinCount = Arrays.stream(colors).filter(i -> i != null && i == 3).count();
        assertEquals(1, assassinCount, "There must be exactly one assassin card (value 3)");
    }

    @Test
    void updateVotes_throwsForIncorrectIndex() {
        UUID id = UUID.randomUUID();
        GameSession gs = new GameSession();
        GameState state = new GameState();
        state.setCardsVotes(new ArrayList<>(List.of(0,0,0)));
        gs.setGameState(state);
        when(gameSessionRepository.findBySessionId(id)).thenReturn(Optional.of(gs));

        CardsVoteRequest req = new CardsVoteRequest();
        req.setCardIndex(10);
        req.setAddingVote(true);

        assertThrows(IllegalArgumentException.class, () -> service.updateVotes(id, req));
    }
}
