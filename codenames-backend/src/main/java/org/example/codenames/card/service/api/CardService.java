package org.example.codenames.card.service.api;

import org.example.codenames.card.entity.Card;

import java.util.List;
import java.util.Optional;

/**
 * Default implementation of the {@link CardService} interface.
 * This service provides methods to retrieve, create, and filter cards.
 */
public interface CardService {

    /**
     * Retrieves a card by its unique identifier.
     *
     * @param id The unique identifier of the card.
     * @return An {@code Optional} containing the card if found, otherwise empty.
     */
    Optional<Card> getCardById(String id);

    /**
     * Creates and saves a new card in the repository.
     *
     * @param card The card to be created.
     * @return The saved {@link Card} instance.
     */
    Card createCard(Card card);

    /**
     * Retrieves a list of card names available in a specific language.
     *
     * @param language The language code used for filtering.
     * @return A list of card names in the specified language.
     */
    List<String> getCardsInLanguage(String language);
}
