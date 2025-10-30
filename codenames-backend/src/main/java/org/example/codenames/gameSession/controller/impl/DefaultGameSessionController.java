package org.example.codenames.gameSession.controller.impl;

import org.example.codenames.gameSession.controller.api.GameSessionController;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.entity.dto.GameSessionRoomLobbyDTO;
import org.example.codenames.gameSession.repository.api.GameSessionRepository;
import org.example.codenames.gameSession.service.api.GameSessionService;
import org.example.codenames.gameState.service.api.GameStateService;
import org.example.codenames.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.example.codenames.gameSession.entity.dto.GameSessionMapper.toRoomLobbyDTO;
import static org.example.codenames.user.entity.dto.UserMapper.toRoomLobbyDTOList;

/**
 * Default implementation of the GameSessionController interface.
 * This class is responsible for handling HTTP requests related to game sessions
 */
@RestController
@RequestMapping("/api/game-session")
public class DefaultGameSessionController implements GameSessionController {
    /**
     * The GameSessionService instance used to interact with the game session
     */
    private final GameSessionService gameSessionService;

    /**
     * The GameSessionRepository instance used to interact with the game session database
     */
    private final GameSessionRepository gameSessionRepository;

    /**
     * The GameStateService instance used to interact with the game state
     */
    private final GameStateService gameStateService;

    /**
     * Constructor for the DefaultGameSessionController class
     *
     * @param gameSessionService    The GameSessionService instance used to interact with the game session repository
     * @param gameSessionRepository The GameSessionRepository instance used to interact with the game session database
     * @param gameStateService      The GameStateService instance used to interact with the game session repository
     */
    @Autowired
    public DefaultGameSessionController(GameSessionService gameSessionService, GameSessionRepository gameSessionRepository, GameStateService gameStateService) {
        this.gameSessionService = gameSessionService;
        this.gameSessionRepository = gameSessionRepository;
        this.gameStateService = gameStateService;
    }

    /**
     * Get game session by id
     *
     * @param gameId The id of the game session to retrieve
     * @return The game session with the specified id
     */
    @GetMapping("/{gameId}")
    public ResponseEntity<GameSessionRoomLobbyDTO> getGameSession(@PathVariable String gameId) {
        GameSession gameSession = gameSessionService.getGameSessionById(UUID.fromString(gameId));

        if (gameSession != null) {
            return ResponseEntity.ok(toRoomLobbyDTO(Optional.of(gameSession)));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get states of cards in the game session
     *
     * @param gameId The id of the game session to retrieve
     * @return The states of cards in the game session
     */
    @GetMapping("/{gameId}/cards")
    public String[] getGameStateCards(@PathVariable UUID gameId) {
        return gameSessionService.getCardsBySessionId(gameId);
    }

    /**
     * Get the colors of cards in the game session
     *
     * @param gameId The id of the game session to retrieve
     * @return The colors of cards in the game session
     */
    @GetMapping("/{gameId}/cards-colors")
    public Integer[] getGameStateCardsColors(@PathVariable UUID gameId) {
        return gameSessionService.getCardsColorsBySessionId(gameId);
    }

    /**
     * Get the votes for leaders
     *
     * @param gameId The id of the game session
     * @return The votes for leaders
     */
    @GetMapping("/{gameId}/assign-leaders")
    public ResponseEntity<String> getVotes(@PathVariable UUID gameId) {
        GameSession gameSession = gameSessionService.getGameSessionById(gameId);

        gameSession.setStatus(GameSession.sessionStatus.IN_PROGRESS);
        gameSessionRepository.save(gameSession);

        // Check if game session exists
        if (gameSession.getGameState().getBlueTeamLeader() == null || gameSession.getGameState().getRedTeamLeader() == null) {
            gameSessionService.assignTeamLeaders(gameId);
            gameStateService.chooseRandomCurrentLeader(gameId);
        } else {
            return ResponseEntity.status(208).body("Duplicate action detected, already reported.");
        }

        return ResponseEntity.ok().build();
    }

    /**
     * Get users assigned to a team
     *
     * @param gameId    The id of the game session
     * @param teamIndex The index of the team
     * @return The votes for leaders
     */
    @GetMapping("/{gameId}/team")
    public ResponseEntity<?> getUsersByTeam(@PathVariable String gameId, @RequestParam String teamIndex) {
        GameSession gameSession = gameSessionService.getGameSessionById(UUID.fromString(gameId));
        int teamIndexInt;

        // Parse team index
        try {
            teamIndexInt = Integer.parseInt(teamIndex);
        } catch (Exception e) {
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

    /**
     * Authenticates password for a session.
     *
     * @param gameId          the id of the game session
     * @param enteredPassword password given by user
     * @return True if password is correct, false otherwise
     */
    @PostMapping("/{gameId}/authenticate-password/{enteredPassword}")
    public ResponseEntity<?> authenticatePassword(@PathVariable String gameId, @PathVariable String enteredPassword) {
        return ResponseEntity.ok(gameSessionService.authenticatePassword(UUID.fromString(gameId), enteredPassword));
    }

    @GetMapping("/{gameId}/get-connected-users")
    public ResponseEntity<?> getConnectedUsers(@PathVariable String gameId) {
        GameSession gameSession = gameSessionService.getGameSessionById(UUID.fromString(gameId));

        return ResponseEntity.ok(toRoomLobbyDTOList(gameSession.getConnectedUsers()));
    }
}