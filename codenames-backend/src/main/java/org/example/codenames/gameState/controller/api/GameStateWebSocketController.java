package org.example.codenames.gameState.controller.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.UUID;

public interface GameStateWebSocketController {
    ResponseEntity<Void> nextTurn(@PathVariable UUID gameId, @RequestParam Integer turn);
}
