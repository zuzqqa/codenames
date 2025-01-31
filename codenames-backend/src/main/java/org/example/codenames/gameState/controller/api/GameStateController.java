package org.example.codenames.gameState.controller.api;

import org.example.codenames.gameSession.entity.VoteRequest;
import org.example.codenames.gameState.entity.CardsVoteRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

public interface GameStateController {
    ResponseEntity<?> submitVotes(@PathVariable UUID id, @RequestBody CardsVoteRequest cardsVoteRequest);
}
