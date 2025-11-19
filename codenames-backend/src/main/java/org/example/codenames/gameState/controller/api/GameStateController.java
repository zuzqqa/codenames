package org.example.codenames.gameState.controller.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.UUID;

/**
 * Controller for game state related operations.
 * This class is responsible for handling HTTP requests related to game state.
 */
public interface GameStateController {

    /**
     * Get cards for the game with the given id.
     *
     * @param gameId   id of the game.
     * @param language Language of the cards.
     * @return ResponseEntity containing the list of cards.
     */
    ResponseEntity<List<String>> getCards(@PathVariable UUID gameId, @RequestParam String language);
}
