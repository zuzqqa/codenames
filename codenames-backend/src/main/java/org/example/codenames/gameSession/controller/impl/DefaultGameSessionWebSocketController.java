package org.example.codenames.gameSession.controller.impl;

import lombok.AllArgsConstructor;
import org.example.codenames.DynamicGameTurnScheduler;
import org.example.codenames.gameSession.controller.api.GameSessionWebSocketController;
import org.example.codenames.gameSession.entity.CreateGameRequest;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.entity.HintRequest;
import org.example.codenames.gameSession.repository.api.GameSessionRepository;
import org.example.codenames.gameSession.service.api.GameSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@AllArgsConstructor
@RestController
@RequestMapping("/api/game-session")
public class DefaultGameSessionWebSocketController implements GameSessionWebSocketController {
    private final GameSessionService gameSessionService;
    private final SimpMessagingTemplate messagingTemplate;
    private final GameSessionRepository gameSessionRepository;
    private final DynamicGameTurnScheduler turnScheduler;

    @Autowired
    public DefaultGameSessionWebSocketController(SimpMessagingTemplate messagingTemplate, GameSessionService gameSessionService, GameSessionRepository gameSessionRepository, DynamicGameTurnScheduler turnScheduler) {
        this.gameSessionService = gameSessionService;
        this.messagingTemplate = messagingTemplate;
        this.gameSessionRepository = gameSessionRepository;
        this.turnScheduler = turnScheduler;
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> createGameSession(@RequestBody CreateGameRequest request) {
        String gameId = gameSessionService.createGameSession(request);

        Map<String, String> response = new HashMap<>();
        response.put("gameId", gameId);

        messagingTemplate.convertAndSend("/game/all" , gameSessionService.getAllGameSessions());

        return ResponseEntity.ok(response);
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

    @PostMapping("/{gameId}/start")
    public ResponseEntity<Void> startGame(@PathVariable UUID gameId) {
        GameSession gameSession = gameSessionRepository.findBySessionId(gameId)
                .orElseThrow(() -> new RuntimeException("Gra nie znaleziona"));

        gameSession.setStatus(GameSession.sessionStatus.IN_PROGRESS);
        gameSessionRepository.save(gameSession);
        messagingTemplate.convertAndSend("/game/" + gameId, gameSessionRepository.findBySessionId(gameId));

        turnScheduler.scheduleGameTurns(gameSession);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/finish")
    public ResponseEntity<Void> finishGame(@PathVariable UUID id) {
        turnScheduler.cancelGameTurns(id);

        GameSession gameSession = gameSessionRepository.findBySessionId(id)
                .orElseThrow(() -> new RuntimeException("Gra nie znaleziona"));
        gameSession.setStatus(GameSession.sessionStatus.FINISHED);
        gameSessionRepository.save(gameSession);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/all")
    public ResponseEntity<?> getGameSessions() {
        List<GameSession> gameSessions = gameSessionService.getAllGameSessions();

        if (gameSessions.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        messagingTemplate.convertAndSend("/game/all" , gameSessions);

        return ResponseEntity.ok(gameSessions);
    }

    @PostMapping("/{gameId}/send-hint")
    public ResponseEntity<Void> sendHint(@PathVariable UUID gameId, @RequestBody HintRequest hintRequest) {
        GameSession gameSession = gameSessionRepository.findBySessionId(gameId).orElseThrow(() ->
                new IllegalArgumentException("Gra o ID " + gameId + " nie istnieje"));

        gameSession.getGameState().setHint(hintRequest.getHint());
        gameSessionRepository.save(gameSession);

        messagingTemplate.convertAndSend("/game/" + gameId + "/timer", gameSession);
        return ResponseEntity.ok().build();
    }
}
