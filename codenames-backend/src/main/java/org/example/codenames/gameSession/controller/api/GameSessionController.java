package org.example.codenames.gameSession.controller.api;

import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.entity.VoteRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.UUID;

/**
 * Interface for the GameSessionController
 * This controller is responsible for handling requests related to the game session
 */
public interface GameSessionController {
    /**
     * Get the game session by id
     * @param gameId the id of the game session
     * @return the game session with the given id
     */
    ResponseEntity<GameSession> getGameSession(@PathVariable String gameId);

    /**
     * Submit a vote on a card
     * @param id the id of the game session
     * @param voteRequest the vote request
     * @return the response entity
     */
    ResponseEntity<?> submitVote(@PathVariable UUID id, @RequestBody VoteRequest voteRequest);

    /**
     * Get the votes for the game session
     * @param id the id of the game session
     * @return the votes for the game session
     */
    ResponseEntity<String> getVotes(@PathVariable UUID id);

    /**
     * Get the users by team
     * @param gameId the id of the game session
     * @param teamIndex the index of the team
     * @return the response entity
     */
    ResponseEntity<?> getUsersByTeam(@PathVariable String gameId, @RequestParam String teamIndex);
}
