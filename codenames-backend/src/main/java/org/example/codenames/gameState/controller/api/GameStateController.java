package org.example.codenames.gameState.controller.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.UUID;

/**
 * Controller for game state related operations.
 */
public interface GameStateController {

    ResponseEntity<List<String>> getCards(@PathVariable UUID gameId, @RequestParam String language);
}
