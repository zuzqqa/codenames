package org.example.codenames.card.controller.api;

import jakarta.servlet.http.HttpServletResponse;
import org.example.codenames.card.entity.Card;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;

import java.util.List;

/**
 *
 * REST endpoints for card management
 * It implements basic CRUD operations for cards
 * It also provides an endpoint for card authentication
 *
 */

public interface CardController {

    // Create a new card
    public ResponseEntity<Void> createCard(Card card, HttpServletResponse response);

    // Get a card by ID
    public ResponseEntity<Card> getCardById(String id);

    // Get all cards
    public List<Card> getAllCards();

    // Update a card by ID
    public ResponseEntity<Card> updateCard(String id, Card updatedCard);

    // Delete a card by ID
    public ResponseEntity<Void> deleteCardById(String id);


}
