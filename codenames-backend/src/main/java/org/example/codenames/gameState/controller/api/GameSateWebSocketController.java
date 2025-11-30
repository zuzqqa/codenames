package org.example.codenames.gameState.controller.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.example.codenames.gameState.entity.CardsVoteRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.UUID;

/**
 * Interface for the GameSateWebSocketController
 * This controller is used to manage the game states
 */
public interface GameSateWebSocketController {

    /**
     * Submit votes for the game with the given id.
     *
     * @param gameId      id of the game.
     * @param voteRequest the vote request containing the votes.
     * @return ResponseEntity containing the result of the operation.
     */
    ResponseEntity<?> submitVotes(@PathVariable UUID gameId, @RequestBody CardsVoteRequest voteRequest) throws JsonProcessingException;
}
