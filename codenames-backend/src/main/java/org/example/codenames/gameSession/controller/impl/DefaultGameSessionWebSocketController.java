package org.example.codenames.gameSession.controller.impl;

import lombok.AllArgsConstructor;
import org.example.codenames.gameSession.controller.api.GameSessionWebSocketController;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.repository.api.GameSessionRepository;
import org.example.codenames.gameSession.service.api.GameSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@AllArgsConstructor
@RestController
@RequestMapping("/api/game-session")
public class DefaultGameSessionWebSocketController implements GameSessionWebSocketController {
    private final GameSessionService gameSessionService;
    private final SimpMessagingTemplate messagingTemplate;
    private final GameSessionRepository gameSessionRepository;

    @Autowired
    public DefaultGameSessionWebSocketController(SimpMessagingTemplate messagingTemplate, GameSessionService gameSessionService, GameSessionRepository gameSessionRepository) {
        this.gameSessionService = gameSessionService;
        this.messagingTemplate = messagingTemplate;
        this.gameSessionRepository = gameSessionRepository;
    }

    @PostMapping("/{gameId}/connect")
    public ResponseEntity<Void> connectPlayer(@PathVariable UUID gameId, @RequestParam String userId, @RequestParam String teamIndex) {
        int teamIndexInt;

        try {
            teamIndexInt = Integer.parseInt(teamIndex);
        }
        catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }

        try {
            boolean added = gameSessionService.addPlayerToSession(gameId, userId, teamIndexInt);

            if (added) {
                messagingTemplate.convertAndSend("/game/" + gameId, gameSessionRepository.findBySessionId(gameId));
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.status(409).build();
            }
        } catch(Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/{gameId}/disconnect")
    public ResponseEntity<Void> disconnectPlayer(@PathVariable UUID gameId, @RequestParam String userId) {
        try {
            boolean removed = gameSessionService.removePlayerFromSession(gameId, userId);

            if (removed) {
                messagingTemplate.convertAndSend("/game/" + gameId, gameSessionRepository.findBySessionId(gameId));
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.status(404).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<Void> startGame(@PathVariable UUID id) {
        try {
            gameSessionService.updateStatus(id, GameSession.sessionStatus.IN_PROGRESS);
            messagingTemplate.convertAndSend("/game/" + id, gameSessionRepository.findBySessionId(id));
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/{id}/finish")
    public ResponseEntity<Void> finishGame(@PathVariable UUID id) {
        try {
            gameSessionService.updateStatus(id, GameSession.sessionStatus.FINISHED);
            messagingTemplate.convertAndSend("/game/" + id, gameSessionRepository.findBySessionId(id));
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
