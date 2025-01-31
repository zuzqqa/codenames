package org.example.codenames.gameState.controller.api;

import org.example.codenames.gameState.entity.CardsVoteRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

public interface GameStateController {
    ResponseEntity<?> submitVotes(@PathVariable UUID id, @RequestBody CardsVoteRequest cardsVoteRequest);
    ResponseEntity<List<String>> getCards(@PathVariable UUID gameId, @RequestParam String language);
}
