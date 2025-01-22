package org.example.codenames.gameSession.controller.api;

import org.example.codenames.gameSession.entity.CreateGameRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

public interface GameSessionController {
    public ResponseEntity<Map<String, String>> createGameSession(@RequestBody CreateGameRequest request);
}
