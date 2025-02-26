package org.example.codenames.gameState.controller.impl;

import org.example.codenames.card.service.api.CardService;
import org.example.codenames.gameState.controller.api.GameStateController;
import org.example.codenames.gameState.entity.CardsVoteRequest;
import org.example.codenames.gameState.service.api.GameStateService;
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
     * Service for game state related operations.
     */
    private final GameStateService gameStateService;

    /**
     * Service for card related operations.
     */
    private final CardService cardService;

    /**
     * Constructor for DefaultGameStateController.
     * @param gameStateService Service for game state related operations.
     * @param cardService Service for card related operations.
     */
    @Autowired
    public DefaultGameStateController(GameStateService gameStateService, CardService cardService) {
        this.gameStateService = gameStateService;
        this.cardService = cardService;
    }

    /**
     * Submit votes for the game with the given id.
     * @param id Id of the game.
     * @param cardsVoteRequest Request containing the selected cards.
     * @return ResponseEntity containing the result of the operation.
     */
    @PostMapping("/{id}/vote")
    public ResponseEntity<?> submitVotes(@PathVariable UUID id, @RequestBody CardsVoteRequest cardsVoteRequest) {
        gameStateService.updateVotes(id, cardsVoteRequest.getSelectedCards());

        return ResponseEntity.ok("Votes submitted successfully");
    }

    /**
     * Get cards for the game with the given id.
     * @param gameId Id of the game.
     * @param language Language of the cards.
     * @return ResponseEntity containing the list of cards.
     */
    @GetMapping("/{gameId}/get-cards")
    public ResponseEntity<List<String>> getCards(@PathVariable UUID gameId, @RequestParam String language) {
        List<String> cards = cardService.getCardsInLanguage(language);

        return ResponseEntity.ok(cards);
    }
}
