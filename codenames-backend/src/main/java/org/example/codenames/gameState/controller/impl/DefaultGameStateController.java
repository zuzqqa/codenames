package org.example.codenames.gameState.controller.impl;

import org.example.codenames.gameState.controller.api.GameStateController;
import org.example.codenames.gameState.entity.CardsVoteRequest;
import org.example.codenames.gameState.service.api.GameStateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/game-state")
public class DefaultGameStateController implements GameStateController {
    private final GameStateService gameStateService;

    @Autowired
    public DefaultGameStateController(GameStateService gameStateService) {
        this.gameStateService = gameStateService;
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<?> submitVotes(@PathVariable UUID id, @RequestBody CardsVoteRequest cardsVoteRequest) {
        gameStateService.updateVotes(id, cardsVoteRequest.getSelectedCards());
        return ResponseEntity.ok("Votes submitted successfully");
    }
}
