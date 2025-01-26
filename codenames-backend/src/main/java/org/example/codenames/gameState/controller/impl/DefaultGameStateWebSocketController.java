package org.example.codenames.gameState.controller.impl;

import lombok.AllArgsConstructor;
import org.example.codenames.gameSession.repository.api.GameSessionRepository;
import org.example.codenames.gameSession.service.api.GameSessionService;
import org.example.codenames.gameState.controller.api.GameStateWebSocketController;
import org.example.codenames.gameState.service.api.GameStateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@AllArgsConstructor
@RestController
@RequestMapping("/api/game-state")
public class DefaultGameStateWebSocketController implements GameStateWebSocketController {
    private final GameStateService gameStateService;
    private final SimpMessagingTemplate messagingTemplate;
    private final GameSessionRepository gameSessionRepository;

    @Autowired
    public DefaultGameStateWebSocketController(SimpMessagingTemplate messagingTemplate, GameStateService gameStateService, GameSessionRepository gameSessionRepository) {
        this.gameStateService = gameStateService;
        this.messagingTemplate = messagingTemplate;
        this.gameSessionRepository = gameSessionRepository;
    }

    @GetMapping("/{gameId}/next-turn")
    public ResponseEntity<Void> nextTurn(@PathVariable UUID gameId, @RequestParam Integer turn) {
        gameStateService.changeTurns(gameId, turn);
        messagingTemplate.convertAndSend("/game/" + gameId, gameSessionRepository.findBySessionId(gameId));
        return ResponseEntity.noContent().build();
    }
}
