package org.example.codenames.gameSession.controller.impl;

import org.example.codenames.gameSession.controller.api.GameSessionController;
import org.example.codenames.gameSession.entity.CreateGameRequest;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.entity.HintRequest;
import org.example.codenames.gameSession.entity.VoteRequest;
import org.example.codenames.gameSession.repository.api.GameSessionRepository;
import org.example.codenames.gameSession.service.api.GameSessionService;
import org.example.codenames.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
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
    public DefaultGameSessionController(GameSessionService gameSessionService, GameSessionRepository gameSessionRepository, SimpMessagingTemplate messagingTemplate) {
        this.gameSessionService = gameSessionService;
    }

    @GetMapping("/{gameId}")
    public ResponseEntity<GameSession> getGameSession(@PathVariable String gameId) {
        GameSession gameSession = gameSessionService.getGameSessionById(UUID.fromString(gameId));

        if (gameSession != null) {
            return ResponseEntity.ok(gameSession);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/cards")
    public String[] getGameStateCards(@PathVariable UUID id) {
        return gameSessionService.getCardsBySessionId(id);
    }

    @GetMapping("/{id}/cards-colors")
    public Integer[] getGameStateCardsColors(@PathVariable UUID id) {
        return gameSessionService.getCardsColorsBySessionId(id);
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
            if (gameSession.getGameState().getBlueTeamLeader() == null) {
                gameSessionService.assignTeamLeaders(id);
            }
            else {
                return ResponseEntity.status(208).body("Duplicate action detected, already reported.");
            }
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
}
