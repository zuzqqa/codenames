package org.example.codenames.unitTests;

import org.example.codenames.card.entity.Card;
import org.example.codenames.card.repository.CardRepository;
import org.example.codenames.card.service.impl.DefaultCardService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DefaultCardServiceTest {

    @Mock
    CardRepository cardRepository;

    @InjectMocks
    DefaultCardService cardService;

    @Test
    void getCardById_returnsCardWhenFound() {
        Card card = new Card();
        card.setId("card1");
        when(cardRepository.findById("card1")).thenReturn(Optional.of(card));

        Optional<Card> result = cardService.getCardById("card1");

        assertTrue(result.isPresent());
        assertEquals("card1", result.get().getId());
    }

    @Test
    void getCardById_returnsEmptyWhenNotFound() {
        when(cardRepository.findById("missing")).thenReturn(Optional.empty());

        Optional<Card> result = cardService.getCardById("missing");

        assertTrue(result.isEmpty());
    }

    @Test
    void createCard_savesAndReturnsCard() {
        Card card = new Card();
        card.setId("c2");
        when(cardRepository.save(card)).thenReturn(card);

        Card saved = cardService.createCard(card);

        assertNotNull(saved);
        assertEquals("c2", saved.getId());
    }

    @Test
    void getCardsInLanguage_returnsListWhenLanguagePresent() {
        Card c1 = new Card();
        c1.setNames(Map.of("en", "One", "pl", "Jeden"));
        Card c2 = new Card();
        c2.setNames(Map.of("en", "Two"));

        when(cardRepository.findAll()).thenReturn(List.of(c1, c2));

        List<String> en = cardService.getCardsInLanguage("en");

        assertEquals(2, en.size());
        assertTrue(en.contains("One"));
        assertTrue(en.contains("Two"));
    }

    @Test
    void getCardsInLanguage_returnsEmptyForNullOrEmptyLanguage() {

        assertEquals(0, cardService.getCardsInLanguage(null).size());
        assertEquals(0, cardService.getCardsInLanguage("").size());
    }
}
