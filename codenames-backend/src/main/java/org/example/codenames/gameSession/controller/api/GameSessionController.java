package org.example.codenames.gameSession.controller.api;

import org.example.codenames.gameSession.entity.GameSession;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.UUID;

/**
 * Interface for the GameSessionController
 * This controller is responsible for handling requests related to the game session
 */
public interface GameSessionController {
    ResponseEntity<GameSession> getGameSession(@PathVariable String gameId);

    ResponseEntity<String> getVotes(@PathVariable UUID id);

    ResponseEntity<?> getUsersByTeam(@PathVariable String gameId, @RequestParam String teamIndex);

    ResponseEntity<?> authenticatePassword(@PathVariable String gameId, @PathVariable String enteredPassword);
}
