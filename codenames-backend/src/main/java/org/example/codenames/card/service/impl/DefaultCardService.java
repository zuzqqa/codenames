package org.example.codenames.card.service.impl;

import org.example.codenames.card.entity.Card;
import org.example.codenames.card.repository.CardRepository;
import org.example.codenames.card.service.api.CardService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Default implementation of the {@link CardService} interface.
 * This service provides methods to retrieve, create, and filter cards.
 */
@Service
public class DefaultCardService implements CardService {
    /**
     * The repository for the {@link Card} entity.
     */
    private final CardRepository cardRepository;

    /**
     * Constructs a {@code DefaultCardService} with the given repository.
     *
     * @param cardRepository The repository for the {@link Card} entity.
     */
    @Autowired
    public DefaultCardService(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    /**
     * Retrieves a card by its unique identifier.
     *
     * @param id The unique identifier of the card.
     * @return An {@code Optional} containing the card if found, otherwise empty.
     */
    @Override
    public Optional<Card> getCardById(String id) {
        return cardRepository.findById(id);
    }

    /**
     * Creates and saves a new card in the repository.
     *
     * @param card The card to be created.
     * @return The saved {@link Card} instance.
     */
    @Override
    public Card createCard(Card card) {
        return cardRepository.save(card);
    }

    /**
     * Retrieves a list of card names available in a specific language.
     *
     * @param language The language code used for filtering.
     * @return A list of card names in the specified language.
     */
    @Override
    public List<String> getCardsInLanguage(String language) {
        if(language != null && !language.isEmpty()) {
            return cardRepository.findAll().stream()
                    .map(card -> card.getNames().getOrDefault(language, ""))
                    .filter(name -> !name.isEmpty())
                    .collect(Collectors.toList());
        } else {
            return List.of();
        }
    }
}
