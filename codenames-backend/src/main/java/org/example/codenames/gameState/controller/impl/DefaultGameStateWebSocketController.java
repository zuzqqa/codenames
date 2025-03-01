package org.example.codenames.gameState.controller.impl;

import lombok.AllArgsConstructor;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.repository.api.GameSessionRepository;
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
     * @param id id of the game.
     * @param cardsVoteRequest Request containing the selected cards.
     * @return ResponseEntity containing the result of the operation.
     */
    @PostMapping("/{id}/voteCards")
    public ResponseEntity<?> submitVotes(@PathVariable UUID id, @RequestBody CardsVoteRequest cardsVoteRequest) {
        gameStateService.updateVotes(id, cardsVoteRequest.getSelectedCards());
        System.out.println(cardsVoteRequest.getSelectedCards());
        GameSession gameSession = gameSessionRepository.findBySessionId(id).orElseThrow(() ->
                new IllegalArgumentException("Game with an ID of " + id + " does not exist."));

        // Send the game session to all clients
        messagingTemplate.convertAndSend("/game/" + id + "/timer", gameSession);

        return ResponseEntity.ok("Votes submitted successfully, sent to game");
    }
}
