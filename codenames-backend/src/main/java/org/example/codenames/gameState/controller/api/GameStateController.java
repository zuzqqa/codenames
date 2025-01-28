package org.example.codenames.gameState.controller.api;

import org.example.codenames.gameSession.entity.VoteRequest;
import org.example.codenames.gameState.entity.CardsVoteRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

public interface GameStateController {
    public ResponseEntity<?> submitVotes(@RequestBody CardsVoteRequest cardsVoteRequest);
}
