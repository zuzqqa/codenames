package org.example.codenames.gameSession.controller.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.example.codenames.gameSession.entity.CreateGameRequest;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.entity.HintRequest;
import org.example.codenames.gameSession.entity.VoteRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;
import java.util.UUID;

/**
 * Interface for the GameSessionWebSocketController
 * This controller is used to manage the game sessions and the players connected to them
 */
public interface GameSessionWebSocketController {

    /**
     * Create a new game session
     *
     * @param request the request containing the game session information
     * @return the response entity containing the game session id
     */
    ResponseEntity<Map<String, String>> createGameSession(@RequestBody CreateGameRequest request) throws JsonProcessingException;

    /**
     * Get game session by id
     *
     * @param gameId The id of the game session to retrieve
     * @return The game session with the specified id
     */
    ResponseEntity<GameSession> getGameSessionFull(@PathVariable String gameId) throws JsonProcessingException;

    /**
     * Connect a player to a game session
     *
     * @param gameId    the game session id
     * @param userId    the user id
     * @param teamIndex the team index
     * @return the response entity
     */
    ResponseEntity<Void> connectPlayer(@PathVariable UUID gameId, @RequestParam String userId, @RequestParam String teamIndex);

    /**
     * Disconnect a player from a game session
     *
     * @param gameId the game session id
     * @param userId the user id
     * @return the response entity
     */
    ResponseEntity<Void> disconnectPlayer(@PathVariable UUID gameId, @RequestParam String userId);

    /**
     * Start the game
     *
     * @param gameId the game session id
     * @return the response entity
     */
    ResponseEntity<Void> startGame(@PathVariable UUID gameId) throws JsonProcessingException;

    /**
     * Finish the game
     *
     * @param gameId the game session id
     * @return the response entity
     * @throws JsonProcessingException if there is an error processing JSON
     */
    ResponseEntity<Void> finishGame(@PathVariable UUID gameId) throws JsonProcessingException;

    /**
     * Get game sessions
     *
     * @return the response entity containing the list of game sessions
     */
    ResponseEntity<?> getGameSessions();

    /**
     * Send hints to the players
     *
     * @param gameId the game session id
     * @param hintRequest the hint request containing the hint information
     * @return the response entity
     * @throws JsonProcessingException if there is an error processing JSON
     */
    ResponseEntity<?> sendHint(@PathVariable UUID gameId, @RequestBody HintRequest hintRequest) throws JsonProcessingException;

    /**
     * Change the turn
     *
     * @param id the game session id
     * @return the response entity
     * @throws JsonProcessingException if there is an error processing JSON
     */
    ResponseEntity<?> changeTurn(@PathVariable UUID id) throws JsonProcessingException;

    /**
     * Reveal card chosen by the currentSelectionLeader
     *
     * @param gameId the id of the game session
     * @param cardIndex index of the card to be revealed
     * @return response entity
     * @throws JsonProcessingException if there is an error processing JSON
     */
    ResponseEntity<?> revealCard(@PathVariable UUID gameId, @RequestBody String cardIndex) throws JsonProcessingException;

    /**
     * Submit a vote for a leader
     *
     * @param gameId the id of the game session
     * @param voteRequest the vote request containing the user id and the id of the user that was voted on
     * @return the id of the user that was voted on
     * @throws JsonProcessingException if there is an error processing JSON
     */
    ResponseEntity<?> submitVote(@PathVariable UUID gameId, @RequestBody VoteRequest voteRequest) throws JsonProcessingException;

    /**
     * Get the current vote state for leader selection
     *
     * @param gameId the id of the game session
     * @return the leader vote state
     */
    ResponseEntity<?> getVoteState(@PathVariable UUID gameId);
}
