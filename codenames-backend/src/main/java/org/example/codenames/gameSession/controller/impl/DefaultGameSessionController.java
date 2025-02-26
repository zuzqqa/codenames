package org.example.codenames.gameSession.controller.impl;

import org.example.codenames.gameSession.controller.api.GameSessionController;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.entity.VoteRequest;
import org.example.codenames.gameSession.repository.GameSessionRepository;
import org.example.codenames.gameSession.service.api.GameSessionService;
import org.example.codenames.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Default implementation of the GameSessionController interface.
 * This class is responsible for handling HTTP requests related to game sessions
 */
@RestController
@RequestMapping("/api/game-session")
public class DefaultGameSessionController implements GameSessionController {
    /**
     * The GameSessionService instance used to interact with the game session repository
     */
    private final GameSessionService gameSessionService;

    /**
     * Constructor for the DefaultGameSessionController class
     * @param gameSessionService The GameSessionService instance used to interact with the game session repository
     * @param gameSessionRepository The GameSessionRepository instance used to interact with the game session database
     * @param messagingTemplate The SimpMessagingTemplate instance used to send messages to connected clients
     */
    @Autowired
    public DefaultGameSessionController(GameSessionService gameSessionService, GameSessionRepository gameSessionRepository, SimpMessagingTemplate messagingTemplate) {
        this.gameSessionService = gameSessionService;
    }

    /**
     * Get game session by id
     * @param gameId The id of the game session to retrieve
     * @return The game session with the specified id
     */
    @GetMapping("/{gameId}")
    public ResponseEntity<GameSession> getGameSession(@PathVariable String gameId) {
        GameSession gameSession = gameSessionService.getGameSessionById(UUID.fromString(gameId));

        if (gameSession != null) {
            return ResponseEntity.ok(gameSession);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get states of cards in the game session
     * @param id The id of the game session to retrieve
     * @return The states of cards in the game session
     */
    @GetMapping("/{id}/cards")
    public String[] getGameStateCards(@PathVariable UUID id) {
        return gameSessionService.getCardsBySessionId(id);
    }

    /**
     * Get the colors of cards in the game session
     * @param id The id of the game session to retrieve
     * @return The colors of cards in the game session
     */
    @GetMapping("/{id}/cards-colors")
    public Integer[] getGameStateCardsColors(@PathVariable UUID id) {
        return gameSessionService.getCardsColorsBySessionId(id);
    }

    /**
     * Submit a vote for a card
     * @param id the id of the game session
     * @param voteRequest the vote request containing the user id and the id of the card that was voted on
     * @return the id of the card that was voted on
     */
    @PostMapping("/{id}/vote")
    public ResponseEntity<?> submitVote(@PathVariable UUID id, @RequestBody VoteRequest voteRequest) {
        gameSessionService.submitVote(id, voteRequest.getUserId(), voteRequest.getVotedUserId());

        return ResponseEntity.ok(voteRequest.getVotedUserId());
    }

    /**
     * Get the votes for leaders
     * @param id the id of the game session
     * @return the votes for leaders
     */
    @GetMapping("/{id}/assign-leaders")
    public ResponseEntity<String> getVotes(@PathVariable UUID id) {
        GameSession gameSession = gameSessionService.getGameSessionById(id);

        // Check if game session exists
        if (gameSession != null) {
            if (gameSession.getGameState().getBlueTeamLeader() == null) {
                gameSessionService.assignTeamLeaders(id);
            }
            else {
                return ResponseEntity.status(208).body("Duplicate action detected, already reported.");
            }
        }

        return ResponseEntity.ok().build();
    }

    /**
     * Get users assigned to a team
     * @param gameId the id of the game session
     * @param teamIndex the index of the team
     * @return the votes for leaders
     */
    @GetMapping("/{gameId}/team")
    public ResponseEntity<?> getUsersByTeam(@PathVariable String gameId, @RequestParam String teamIndex) {
        GameSession gameSession = gameSessionService.getGameSessionById(UUID.fromString(gameId));
        int teamIndexInt;

        // Parse team index
        try {
            teamIndexInt = Integer.parseInt(teamIndex);
        }
        catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }

        // Check if game session exists
        if (gameSession == null) {
            return ResponseEntity.status(404).body("Game session not found");
        }

        List<List<User>> connectedUsers = gameSession.getConnectedUsers();

        // Check if team index is valid
        if (teamIndexInt < 0 || teamIndexInt >= connectedUsers.size()) {
            return ResponseEntity.status(400).body("Invalid team index. Must be 0 (red) or 1 (blue).");
        }

        List<User> teamUsers = connectedUsers.get(teamIndexInt);

        return ResponseEntity.ok(teamUsers);
    }
}
