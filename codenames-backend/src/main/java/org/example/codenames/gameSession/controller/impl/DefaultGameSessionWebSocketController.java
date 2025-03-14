package org.example.codenames.gameSession.controller.impl;

import lombok.AllArgsConstructor;
import org.example.codenames.gameSession.controller.api.GameSessionWebSocketController;
import org.example.codenames.gameSession.entity.CreateGameRequest;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.entity.HintRequest;
import org.example.codenames.gameSession.entity.VoteRequest;
import org.example.codenames.gameSession.repository.api.GameSessionRepository;
import org.example.codenames.gameSession.service.api.GameSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Default implementation of the GameSessionWebSocketController interface.
 * This class is responsible for handling WebSocket requests related to game sessions
 */
@AllArgsConstructor
@RestController
@RequestMapping("/api/game-session")
public class DefaultGameSessionWebSocketController implements GameSessionWebSocketController {
    /**
     * The GameSessionService instance used to interact with the game session repository
     */
    private final GameSessionService gameSessionService;

    /**
     * The SimpMessagingTemplate instance used to send messages to connected clients
     */
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * The GameSessionRepository instance used to interact with the game session database
     */
    private final GameSessionRepository gameSessionRepository;

    /**
     * Constructor for the DefaultGameSessionWebSocketController class
     * @param messagingTemplate The SimpMessagingTemplate instance used to send messages to connected clients
     * @param gameSessionService The GameSessionService instance used to interact with the game session repository
     * @param gameSessionRepository The GameSessionRepository instance used to interact with the game session database
     */
    @Autowired
    public DefaultGameSessionWebSocketController(SimpMessagingTemplate messagingTemplate, GameSessionService gameSessionService, GameSessionRepository gameSessionRepository) {
        this.gameSessionService = gameSessionService;
        this.messagingTemplate = messagingTemplate;
        this.gameSessionRepository = gameSessionRepository;
    }

    /**
     * Create a new game session
     * @param request the request containing the game session information
     * @return the response entity containing the game session id
     */
    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> createGameSession(@RequestBody CreateGameRequest request) {
        // Create a new game session
        String gameId = gameSessionService.createGameSession(request);
        Map<String, String> response = new HashMap<>();

        // Add the game id to the response
        response.put("gameId", gameId);

        // Send the game session to all clients
        messagingTemplate.convertAndSend("/game/all" , gameSessionService.getAllGameSessions());

        return ResponseEntity.ok(response);
    }

    /**
     * Connect a player to a game session
     * @param gameId the game session id
     * @param userId the user id
     * @param teamIndex the team index
     * @return the response entity
     */
    @PostMapping("/{gameId}/connect")
    public ResponseEntity<Void> connectPlayer(@PathVariable UUID gameId, @RequestParam String userId, @RequestParam String teamIndex) {
        int teamIndexInt;

        try {
            teamIndexInt = Integer.parseInt(teamIndex);
        }
        catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }

        try {
            // Add the player to the game session
            boolean added = gameSessionService.addPlayerToSession(gameId, userId, teamIndexInt);

            if (added) {
                // Send the game session to all clients
                messagingTemplate.convertAndSend("/game/" + gameId, gameSessionRepository.findBySessionId(gameId));

                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.status(409).build();
            }
        } catch(Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Disconnect a player from a game session
     * @param gameId the game session id
     * @param userId the user id
     * @return the response entity
     */
    @DeleteMapping("/{gameId}/disconnect")
    public ResponseEntity<Void> disconnectPlayer(@PathVariable UUID gameId, @RequestParam String userId) {
        try {
            // Remove the player from the game session
            boolean removed = gameSessionService.removePlayerFromSession(gameId, userId);

            if (removed) {
                // Send the game session to all clients
                messagingTemplate.convertAndSend("/game/" + gameId, gameSessionRepository.findBySessionId(gameId));

                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.status(404).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Start the game
     * @param gameId the game session id
     * @return the response entity
     */
    @Override
    @PostMapping("/{gameId}/start")
    public ResponseEntity<Void> startGame(@PathVariable UUID gameId) {
        // Set the game session status to leader selection
        GameSession gameSession = gameSessionRepository.findBySessionId(gameId)
                .orElseThrow(() -> new RuntimeException("Game with an ID of " + gameId + " does not exist."));

        gameSession.setStatus(GameSession.sessionStatus.LEADER_SELECTION);
        gameSession.setVotingStartTime(System.currentTimeMillis());

        gameSessionRepository.save(gameSession);

        // Send the game session to all clients
        messagingTemplate.convertAndSend("/game/" + gameId, gameSessionRepository.findBySessionId(gameId));

        return ResponseEntity.ok().build();
    }

    /**
     * Finish the game
     * @param gameId the game session id
     * @return the response entity
     */
    @PostMapping("/{gameId}/finish")
    public ResponseEntity<Void> finishGame(@PathVariable UUID gameId) {
        GameSession gameSession = gameSessionRepository.findBySessionId(gameId)
                .orElseThrow(() -> new RuntimeException("Game with an ID of " + gameId + " does not exist."));

        // Set the game session status to finished
        gameSession.setStatus(GameSession.sessionStatus.FINISHED);
        gameSessionRepository.save(gameSession);

        return ResponseEntity.ok().build();
    }

    /**
     * Get game sessions
     * @return the response entity containing the list of game sessions
     */
    @GetMapping("/all")
    public ResponseEntity<?> getGameSessions() {
        // Get all game sessions
        List<GameSession> gameSessions = gameSessionService.getAllGameSessions();

        if (gameSessions.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        // Send the game sessions to all clients
        messagingTemplate.convertAndSend("/game/all" , gameSessions);

        return ResponseEntity.ok(gameSessions);
    }

    /**
     * Send hints to the players
     * @param gameId the game session id
     * @param hintRequest the hint request containing the hint information
     * @return the response entity
     */
    @PostMapping("/{gameId}/send-hint")
    public ResponseEntity<Void> sendHint(@PathVariable UUID gameId, @RequestBody HintRequest hintRequest) {
        GameSession gameSession = gameSessionRepository.findBySessionId(gameId).orElseThrow(() ->
                new IllegalArgumentException("Game with an ID of " + gameId + " does not exist."));

        // Set the hint for the game session
        gameSession.getGameState().setHint(hintRequest.getHint());
        gameSessionRepository.save(gameSession);

        // Send the game session to all clients
        messagingTemplate.convertAndSend("/game/" + gameId + "/timer", gameSession);

        return ResponseEntity.ok().build();
    }

    /**
     * Change the turn
     * @param id the game session id
     * @return the response entity
     */
    @GetMapping("/{id}/change-turn")
    public ResponseEntity<?> changeTurn(@PathVariable UUID id) {
        // Change the turn
        gameSessionService.changeTurn(id);

        GameSession gameSession = gameSessionRepository.findBySessionId(id).orElseThrow(() ->
                new IllegalArgumentException("Game with an ID of " + id + " does not exist."));

        // Send the game session to all clients
        messagingTemplate.convertAndSend("/game/" + id + "/timer", gameSession);

        return ResponseEntity.ok("Turn changed");
    }

    /**
     * Submit a vote for a leader
     * @param gameId the id of the game session
     * @param voteRequest the vote request containing the user id and the id of the user that was voted on
     * @return the id of the user that was voted on
     */
    @Override
    @PostMapping("/{gameId}/vote")
    public ResponseEntity<?> submitVote(@PathVariable UUID gameId, @RequestBody VoteRequest voteRequest) {
        // Submit vote
        gameSessionService.submitVote(gameId, voteRequest.getUserId(), voteRequest.getVotedUserId());
        gameSessionService.chooseRandomCurrentLeader(gameId);

        GameSession gameSession = gameSessionRepository.findBySessionId(gameId).orElseThrow(() ->
                new IllegalArgumentException("Game with an ID of " + gameId + " does not exist."));

        // Send the game session to all clients
        messagingTemplate.convertAndSend("/game/" + gameId + "/timer", gameSession);
        
        return ResponseEntity.ok(voteRequest.getVotedUserId());
    }
}
