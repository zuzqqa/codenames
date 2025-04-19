package org.example.codenames.unitTests;


import org.example.codenames.card.entity.Card;
import org.example.codenames.card.repository.CardRepository;
import org.example.codenames.card.service.impl.DefaultCardService;
import org.example.codenames.card.service.api.CardService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

/**
 * Basic unit tests for the {@link CardService} interface default implementation.
 */
@ExtendWith(MockitoExtension.class)
public class CardServiceTest {

    @Mock
    private CardRepository cardRepository;

    @InjectMocks
    private DefaultCardService cardService;

    /**
     * Tests the retrieval of a card by its unique identifier.
     */
    @Test
    public void shouldGetCardById() {
        String cardId = "1";
        Card card = new Card();
        when(cardRepository.findById(cardId)).thenReturn(Optional.of(card));
        cardService.getCardById(cardId);
        verify(cardRepository).findById(cardId);
        assertEquals(cardService.getCardById(cardId), Optional.of(card));
    }

    /**
     * Tests the retrieval of a card by an invalid unique identifier.
     */
    @Test
    public void shouldNotGetCardById() {
        String cardId = "1";
        when(cardRepository.findById(cardId)).thenReturn(Optional.empty());
        Optional<Card> result = cardService.getCardById(cardId);
        verify(cardRepository).findById(cardId);
        assertEquals(Optional.empty(), result);
    }

    /**
     * Tests the creation of a new card.
     */
    @Test
    public void shouldCreateCard() {
        Card card = new Card();
        when(cardRepository.save(card)).thenReturn(card);
        Card result = cardService.createCard(card);
        verify(cardRepository).save(card);
        assertEquals(card, result);
    }

    /**
     * Tests the creation of a new card when the repository throws an exception.
     */
    @Test
    public void shouldNotCreateCard_WhenRepositoryThrowsException() {
        Card card = new Card();
        doThrow(new RuntimeException("Database error")).when(cardRepository).save(card);

        assertThrows(RuntimeException.class, () -> cardService.createCard(card));
        verify(cardRepository).save(card);
    }

    /**
     * Tests the retrieval of card names in a specific language.
     */
    @Test
    public void shouldReturnCardsInSpecifiedLanguage() {
        Card card1 = new Card();
        card1.setNames(Map.of("en", "Apple", "fr", "Pomme"));

        Card card2 = new Card();
        card2.setNames(Map.of("en", "Banana", "es", "Plátano"));

        when(cardRepository.findAll()).thenReturn(List.of(card1, card2));

        List<String> result = cardService.getCardsInLanguage("en");

        assertEquals(List.of("Apple", "Banana"), result);
        verify(cardRepository).findAll();
    }

    /**
     * Tests the retrieval of card names in a specific language when no cards are available.
     */
    @Test
    public void shouldReturnEmptyListWhenNoCardsInLanguage() {
        Card card1 = new Card();
        card1.setNames(Map.of("fr", "Pomme"));

        Card card2 = new Card();
        card2.setNames(Map.of("es", "Plátano"));

        when(cardRepository.findAll()).thenReturn(List.of(card1, card2));

        List<String> result = cardService.getCardsInLanguage("de");

        assertEquals(List.of(), result);
        verify(cardRepository).findAll();
    }

    /**
     * Tests the retrieval of card names in a specific language when the language is not specified.
     */
    @Test
    public void shouldFilterOutCardsWithoutRequestedLanguage() {
        Card card1 = new Card();
        card1.setNames(Map.of("en", "Apple"));

        Card card2 = new Card();
        card2.setNames(Map.of("es", "Plátano"));

        when(cardRepository.findAll()).thenReturn(List.of(card1, card2));

        List<String> result = cardService.getCardsInLanguage("es");

        assertEquals(List.of("Plátano"), result);
        verify(cardRepository).findAll();
    }

    /**
     * Tests the retrieval of card names in a specific language when no cards exist.
     */
    @Test
    public void shouldReturnEmptyListWhenNoCardsExist() {
        when(cardRepository.findAll()).thenReturn(List.of());

        List<String> result = cardService.getCardsInLanguage("en");

        assertEquals(List.of(), result);
        verify(cardRepository).findAll();
    }

    /**
     * Tests the retrieval of card names in a specific language when the language is null or empty.
     * This tests the behavior of the method when the language parameter is not valid.
     */
    @Test
    public void shouldReturnEmptyListForNullOrEmptyLanguage() {
        Card card1 = new Card();
        card1.setNames(Map.of("en", "Apple"));

        List<String> resultWithNull = cardService.getCardsInLanguage(null);
        List<String> resultWithEmpty = cardService.getCardsInLanguage("");

        assertEquals(List.of(), resultWithNull);
        assertEquals(List.of(), resultWithEmpty);
    }
}
