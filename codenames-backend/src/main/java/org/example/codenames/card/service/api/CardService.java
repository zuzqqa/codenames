package org.example.codenames.card.service.api;

import org.example.codenames.card.entity.Card;

import java.util.List;
import java.util.Optional;

public interface CardService {

    // Create a new card
    public void createCard(Card card);

    // Read: find card by ID
    public Optional<Card> getCardById(String id);

    // Read: find card by name
    public Optional<Card> getCardByName(String name);

    // Read: get all cards
    public List<Card> getAllCards();

    // Update an existing card
    public Card updateCard(String id, Card updatedCard);

    // Delete a card by ID
    public void deleteCardById(String id);
}
