package org.example.codenames.gameState.controller.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
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

    private final GameStateService gameStateService;
    private final GameSessionRepository gameSessionRepository;
    private final SocketService socketService;

    @Override
    @PostMapping("/{gameId}/vote-cards")
    public ResponseEntity<?> submitVotes(@PathVariable UUID gameId, @RequestBody CardsVoteRequest voteRequest) throws JsonProcessingException {
        gameStateService.updateVotes(gameId, voteRequest);

        GameSession gameSession = gameSessionRepository.findBySessionId(gameId).orElseThrow(() ->
                new IllegalArgumentException("Game with an ID of " + gameId + " does not exist."));

        socketService.sendGameSessionUpdate(gameId, gameSession);

        return ResponseEntity.ok("Votes submitted successfully, sent to game");
    }
}
