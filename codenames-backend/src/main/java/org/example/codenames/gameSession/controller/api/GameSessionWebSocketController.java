package org.example.codenames.gameSession.controller.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.UUID;

public interface GameSessionWebSocketController {
    ResponseEntity<Void> connectPlayer(@PathVariable UUID gameId, @RequestParam String userId, @RequestParam String teamIndex);

    ResponseEntity<Void> disconnectPlayer(@PathVariable UUID gameId, @RequestParam String userId);

    ResponseEntity<Void> startGame(@PathVariable UUID id);

    ResponseEntity<Void> finishGame(@PathVariable UUID id);
}
