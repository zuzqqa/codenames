package org.example.codenames.gameSession.controller.impl;

import lombok.extern.slf4j.Slf4j;
import org.example.codenames.discord.service.impl.DiscordGuildService;
import org.example.codenames.gameSession.controller.api.GameSessionController;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.entity.dto.GameSessionRoomLobbyDTO;
import org.example.codenames.gameSession.repository.api.GameSessionRepository;
import org.example.codenames.gameSession.service.api.GameSessionService;
import org.example.codenames.gameState.service.api.GameStateService;
import org.example.codenames.socket.service.api.SocketService;
import org.example.codenames.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import static org.example.codenames.gameSession.entity.dto.mapper.GameSessionMapper.toRoomLobbyDTO;
import static org.example.codenames.user.entity.mapper.UserMapper.toRoomLobbyDTOList;

@Slf4j
@RestController
@RequestMapping("/api/game-session")
public class DefaultGameSessionController implements GameSessionController {

    private final GameSessionService gameSessionService;
    private final GameSessionRepository gameSessionRepository;
    private final GameStateService gameStateService;
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    private final SocketService socketService;
    private final DiscordGuildService discordGuildService;

    @Autowired
    public DefaultGameSessionController(GameSessionService gameSessionService, GameSessionRepository gameSessionRepository, GameStateService gameStateService, SocketService socketService, DiscordGuildService discordGuildService) {
        this.gameSessionService = gameSessionService;
        this.gameSessionRepository = gameSessionRepository;
        this.gameStateService = gameStateService;
        this.socketService = socketService;
        this.discordGuildService = discordGuildService;
    }

    @GetMapping("/{gameId}")
    public ResponseEntity<GameSessionRoomLobbyDTO> getGameSession(@PathVariable String gameId) {
        GameSession gameSession = gameSessionService.getGameSessionById(UUID.fromString(gameId));

        if (gameSession != null) {
            return ResponseEntity.ok(toRoomLobbyDTO(Optional.of(gameSession)));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{gameId}/cards")
    public String[] getGameStateCards(@PathVariable UUID gameId) {
        return gameSessionService.getCardsBySessionId(gameId);
    }

    @GetMapping("/{gameId}/cards-colors")
    public Integer[] getGameStateCardsColors(@PathVariable UUID gameId) {
        return gameSessionService.getCardsColorsBySessionId(gameId);
    }

    @GetMapping("/{gameId}/assign-leaders")
    public ResponseEntity<String> getVotes(@PathVariable UUID gameId) {
        GameSession gameSession = gameSessionService.getGameSessionById(gameId);

        gameSession.setStatus(GameSession.sessionStatus.IN_PROGRESS);
        gameSessionRepository.save(gameSession);

        if (gameSession.getGameState().getBlueTeamLeader() == null || gameSession.getGameState().getRedTeamLeader() == null) {
            gameSessionService.assignTeamLeaders(gameId);
            scheduler.schedule(() -> {
                try {
                    socketService.sendDiscordLinkInvite(gameSession.getSessionId(), discordGuildService.createInvite(gameSession.getDiscordChannelId()));
                } catch (Exception e) {
                    log.error("Failed to send Discord invite link: {}", e.getMessage());
                }
            }, 3, TimeUnit.SECONDS);
            gameStateService.chooseRandomCurrentLeader(gameId);
        } else {
            return ResponseEntity.status(208).body("Duplicate action detected, already reported.");
        }

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{gameId}/team")
    public ResponseEntity<?> getUsersByTeam(@PathVariable String gameId, @RequestParam String teamIndex) {
        GameSession gameSession = gameSessionService.getGameSessionById(UUID.fromString(gameId));
        int teamIndexInt;

        try {
            teamIndexInt = Integer.parseInt(teamIndex);
        } catch (Exception e) {
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