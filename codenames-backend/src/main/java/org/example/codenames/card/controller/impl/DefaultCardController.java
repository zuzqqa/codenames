package org.example.codenames.card.controller.impl;

import org.example.codenames.card.controller.api.CardController;
import org.example.codenames.card.entity.Card;
import org.example.codenames.card.service.api.CardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing card-related operations.
 * Provides endpoints to retrieve, add, and filter cards by language.
 */
@RestController
@RequestMapping("/api/cards")
public class DefaultCardController implements CardController {
    /**
     * The service responsible for {@link Card} operations.
     */
    private final CardService cardService;

    /**
     * Constructs a DefaultCardController with the specified CardService.
     *
     * @param cardService the service responsible for card operations
     */
    @Autowired
    public DefaultCardController(CardService cardService) {
        this.cardService = cardService;
    }

    /**
     * Retrieves a card by its unique identifier.
     *
     * @param id the ID of the card to retrieve
     * @return ResponseEntity containing the card if found, or a 404 Not Found response if not
     */
    @GetMapping("/{id}")
    public ResponseEntity<Card> getCardById(@PathVariable String id) {
        Optional<Card> card = cardService.getCardById(id);

        return card.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Adds a new card to the database.
     *
     * @param card the card to add
     * @return ResponseEntity containing the added card
     */
    @PostMapping("/add")
    public ResponseEntity<Card> addCard(@RequestBody Card card) {
        Card savedCard = cardService.createCard(card);

        return ResponseEntity.ok(savedCard);
    }

    /**
     * Retrieves all cards in the specified language.
     *
     * @param lang the language to filter by
     * @return ResponseEntity containing a list of card names in the specified language
     */
    @GetMapping("/language")
    public ResponseEntity<List<String>> getCardsInLanguage(@RequestParam String lang) {
        List<String> cards = cardService.getCardsInLanguage(lang);

        return ResponseEntity.ok(cards);
    }
}
