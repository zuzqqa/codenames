package org.example.codenames.gameState.controller.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.AllArgsConstructor;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.repository.api.GameSessionRepository;
import org.example.codenames.gameSession.service.api.GameSessionService;
import org.example.codenames.gameState.controller.api.GameSateWebSocketController;
import org.example.codenames.gameState.entity.CardsVoteRequest;
import org.example.codenames.gameState.service.api.GameStateService;
import org.example.codenames.socket.service.api.SocketService;
import org.springframework.http.ResponseEntity;
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
     * The SocketService instance used to send messages to connected clients
     */
    private final SocketService socketService;

    /**
     * Submit votes for the game with the given id.
     *
     * @param gameId      id of the game.
     * @param voteRequest the vote request containing the votes.
     * 
     * @return ResponseEntity containing the result of the operation.
     */
    @Override
    @PostMapping("/{gameId}/vote-cards")
    public ResponseEntity<?> submitVotes(@PathVariable UUID gameId, @RequestBody CardsVoteRequest voteRequest) throws JsonProcessingException {
        gameStateService.updateVotes(gameId, voteRequest);

        GameSession gameSession = gameSessionRepository.findBySessionId(gameId).orElseThrow(() ->
                new IllegalArgumentException("Game with an ID of " + gameId + " does not exist."));

        // Send the game session to all clients
        socketService.sendGameSessionUpdate(gameId, gameSession);

        return ResponseEntity.ok("Votes submitted successfully, sent to game");
    }
}
