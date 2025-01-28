package org.example.codenames.gameState.controller.impl;

import org.example.codenames.gameSession.entity.VoteRequest;
import org.example.codenames.gameState.entity.CardsVoteRequest;
import org.example.codenames.gameState.entity.GameState;
import org.example.codenames.gameState.service.api.GameStateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/game-state")
public class GameStateController {
    private final GameStateService gameStateService;

    @Autowired
    public GameStateController(GameStateService gameStateService) {
        this.gameStateService = gameStateService;
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<?> submitVotes(@PathVariable UUID id, @RequestBody CardsVoteRequest cardsVoteRequest) {
        gameStateService.updateVotes(id, cardsVoteRequest.getSelectedCards());
        return ResponseEntity.ok("Votes submitted successfully");
    }
}
