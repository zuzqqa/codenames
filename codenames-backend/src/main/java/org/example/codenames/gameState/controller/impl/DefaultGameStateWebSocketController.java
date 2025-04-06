package org.example.codenames.gameState.controller.impl;

import lombok.AllArgsConstructor;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.repository.api.GameSessionRepository;
import org.example.codenames.gameSession.service.api.GameSessionService;
import org.example.codenames.gameState.controller.api.GameSateWebSocketController;
import org.example.codenames.gameState.entity.CardsVoteRequest;
import org.example.codenames.gameState.service.api.GameStateService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@AllArgsConstructor
@RestController
@RequestMapping("/api/game-session")
public class DefaultGameStateWebSocketController implements GameSateWebSocketController {
    /**
     * Service for game session operations.
     */
    private final GameSessionService gameSessionService;

    /**
     * Service for game state related operations.
     */
    private final GameStateService gameStateService;

    /**
     * The GameSessionRepository instance used to interact with the game session database
     */
    private final GameSessionRepository gameSessionRepository;

    /**
     * The SimpMessagingTemplate instance used to send messages to connected clients
     */
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Submit votes for the game with the given id.
     *
     * @param gameId id of the game.
     * @param voteRequest
     *
     * @return ResponseEntity containing the result of the operation.
     */
    @Override
    @PostMapping("/{gameId}/voteCards")
    public ResponseEntity<?> submitVotes(@PathVariable UUID gameId, @RequestBody CardsVoteRequest voteRequest) {
        gameStateService.updateVotes(gameId, voteRequest);

        GameSession gameSession = gameSessionRepository.findBySessionId(gameId).orElseThrow(() ->
                new IllegalArgumentException("Game with an ID of " + gameId + " does not exist."));

        // Send the game session to all clients
        messagingTemplate.convertAndSend("/game/" + gameId + "/timer", gameSession);

        return ResponseEntity.ok("Votes submitted successfully, sent to game");
    }
}
