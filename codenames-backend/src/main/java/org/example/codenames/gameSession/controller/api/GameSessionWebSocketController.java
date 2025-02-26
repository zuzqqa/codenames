package org.example.codenames.gameSession.controller.api;

import org.example.codenames.gameSession.entity.CreateGameRequest;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.entity.HintRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Interface for the GameSessionWebSocketController
 * This controller is used to manage the game sessions and the players connected to them
 */
public interface GameSessionWebSocketController {
    /**
     * Create a new game session
     * @param request the request containing the game session information
     * @return the response entity containing the game session id
     */
    ResponseEntity<Map<String, String>> createGameSession(@RequestBody CreateGameRequest request);

    /**
     * Connect a player to a game session
     * @param gameId the game session id
     * @param userId the user id
     * @param teamIndex the team index
     * @return the response entity
     */
    ResponseEntity<Void> connectPlayer(@PathVariable UUID gameId, @RequestParam String userId, @RequestParam String teamIndex);

    /**
     * Disconnect a player from a game session
     * @param gameId the game session id
     * @param userId the user id
     * @return the response entity
     */
    ResponseEntity<Void> disconnectPlayer(@PathVariable UUID gameId, @RequestParam String userId);

    /**
     * Start the game
     * @param id the game session id
     * @return the response entity
     */
    ResponseEntity<Void> startGame(@PathVariable UUID id);

    /**
     * Finish the game
     * @param id the game session id
     * @return the response entity
     */
    ResponseEntity<Void> finishGame(@PathVariable UUID id);

    /**
     * Get game sessions
     * @return the response entity containing the list of game sessions
     */
    ResponseEntity<?>  getGameSessions();

    /**
     * Send hints to the players
     * @param gameId the game session id
     * @param hintRequest the hint request containing the hint information
     * @return the response entity
     */
    ResponseEntity<?> sendHint(@PathVariable UUID gameId, @RequestBody HintRequest hintRequest);

    /**
     * Change the turn
     * @param id the game session id
     * @return the response entity
     */
    ResponseEntity<?> changeTurn(@PathVariable UUID id);
}
