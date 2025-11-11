package org.example.codenames.card.controller.api;

import org.example.codenames.card.entity.Card;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

/**
 * REST controller for managing card-related operations.
 * Provides endpoints to retrieve, add, and filter cards by language.
 */
public interface CardController {

    /**
     * Retrieves a card by its unique identifier.
     *
     * @param id the ID of the card to retrieve
     * @return ResponseEntity containing the card if found, or a 404 Not Found response if not
     */
    ResponseEntity<Card> getCardById(@PathVariable String id);

    /**
     * Adds a new card to the database.
     *
     * @param card the card to add
     * @return ResponseEntity containing the added card
     */
    ResponseEntity<Card> addCard(@RequestBody Card card);

    /**
     * Retrieves all cards in the specified language.
     *
     * @param lang the language to filter by
     * @return ResponseEntity containing a list of card names in the specified language
     */
    ResponseEntity<List<String>> getCardsInLanguage(@RequestParam String lang);
}
