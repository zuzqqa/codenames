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

public interface GameSessionWebSocketController {
    ResponseEntity<Map<String, String>> createGameSession(@RequestBody CreateGameRequest request);

    ResponseEntity<Void> connectPlayer(@PathVariable UUID gameId, @RequestParam String userId, @RequestParam String teamIndex);

    ResponseEntity<Void> disconnectPlayer(@PathVariable UUID gameId, @RequestParam String userId);

    ResponseEntity<Void> startGame(@PathVariable UUID id);

    ResponseEntity<Void> finishGame(@PathVariable UUID id);

    ResponseEntity<?>  getGameSessions();
    ResponseEntity<?> sendHint(@PathVariable UUID gameId, @RequestBody HintRequest hintRequest);
}
