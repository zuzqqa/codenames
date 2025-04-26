package org.example.codenames.gameState.controller.impl;

import org.example.codenames.card.service.api.CardService;
import org.example.codenames.gameState.controller.api.GameStateController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller for game state related operations.
 * This class is responsible for handling HTTP requests related to game state.
 */
@RestController
@RequestMapping("/api/game-state")
public class DefaultGameStateController implements GameStateController {

    /**
     * Service for card related operations.
     */
    private final CardService cardService;

    /**
     * Constructor for DefaultGameStateController.
     * @param cardService Service for card related operations.
     */
    @Autowired
    public DefaultGameStateController(CardService cardService) {
        this.cardService = cardService;
    }

    /**
     * Get cards for the game with the given id.
     * @param gameId id of the game.
     * @param language Language of the cards.
     * @return ResponseEntity containing the list of cards.
     */
    @GetMapping("/{gameId}/get-cards")
    public ResponseEntity<List<String>> getCards(@PathVariable UUID gameId, @RequestParam String language) {
        List<String> cards = cardService.getCardsInLanguage(language);

        return ResponseEntity.ok(cards);
    }
}
