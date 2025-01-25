package org.example.codenames.gameSession.controller.impl;

import org.example.codenames.gameSession.controller.api.GameSessionController;
import org.example.codenames.gameSession.entity.CreateGameRequest;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.entity.VoteRequest;
import org.example.codenames.gameSession.service.api.GameSessionService;
import org.example.codenames.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/game-session")
public class DefaultGameSessionController implements GameSessionController {
    private final GameSessionService gameSessionService;

    @Autowired
    public DefaultGameSessionController(GameSessionService gameSessionService) {
        this.gameSessionService = gameSessionService;
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> createGameSession(@RequestBody CreateGameRequest request) {
        String gameId = gameSessionService.createGameSession(request);

        Map<String, String> response = new HashMap<>();
        response.put("gameId", gameId);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{gameId}")
    public ResponseEntity<GameSession> getGameSession(@PathVariable String gameId) {
        System.out.println("Received GET request for gameId: " + gameId);
        GameSession gameSession = gameSessionService.getGameSessionById(UUID.fromString(gameId));

        if (gameSession != null) {
            return ResponseEntity.ok(gameSession);
        } else {
            System.out.println("GameSession not found for gameId: " + gameId);
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<Void> startGame(@PathVariable UUID id) {
        gameSessionService.updateStatus(id, GameSession.sessionStatus.IN_PROGRESS);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/finish")
    public ResponseEntity<Void> finishGame(@PathVariable UUID id) {
        gameSessionService.updateStatus(id, GameSession.sessionStatus.FINISHED);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<?> submitVote(@PathVariable UUID id, @RequestBody VoteRequest voteRequest) {
        gameSessionService.submitVote(id, voteRequest.getUserId(), voteRequest.getVotedUserId());
        return ResponseEntity.ok(voteRequest.getVotedUserId());
    }

    @GetMapping("/{id}/assign-leaders")
    public ResponseEntity<String> getVotes(@PathVariable UUID id) {
        GameSession gameSession = gameSessionService.getGameSessionById(id);

        if (gameSession != null) {
            if (gameSession.getGameState().getBlueTeamLeader() != null) {
                gameSessionService.assignTeamLeaders(id);
            }
            else {
                return ResponseEntity.status(208).body("Duplicate action detected, already reported.");
            }
        } else {
            System.out.println("GameSession not found for gameId: " + id);
        }

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{gameId}/team")
    public ResponseEntity<?> getUsersByTeam(@PathVariable String gameId, @RequestParam String teamIndex) {
        GameSession gameSession = gameSessionService.getGameSessionById(UUID.fromString(gameId));
        int teamIndexInt;

        try {
            teamIndexInt = Integer.parseInt(teamIndex);
        }
        catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }

        if (gameSession == null) {
            return ResponseEntity.status(404).body("Game session not found");
        }

        List<List<User>> connectedUsers = gameSession.getConnectedUsers();

        if (teamIndexInt < 0 || teamIndexInt >= connectedUsers.size()) {
            return ResponseEntity.status(400).body("Invalid team index. Must be 0 (red) or 1 (blue).");
        }

        List<User> teamUsers = connectedUsers.get(teamIndexInt);

        return ResponseEntity.ok(teamUsers);
    }

    @GetMapping("/all")
    public ResponseEntity<List<GameSession>> getGameSessions() {
        List<GameSession> gameSessions = gameSessionService.getAllGameSessions();

        if (gameSessions.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(gameSessions);
    }
}
