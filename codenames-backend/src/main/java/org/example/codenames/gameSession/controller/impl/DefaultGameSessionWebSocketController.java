package org.example.codenames.gameSession.controller.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.AllArgsConstructor;
import org.example.codenames.discord.service.impl.DiscordGuildService;
import org.example.codenames.gameSession.controller.api.GameSessionWebSocketController;
import org.example.codenames.gameSession.entity.CreateGameRequest;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.entity.HintRequest;
import org.example.codenames.gameSession.entity.VoteRequest;
import org.example.codenames.gameSession.entity.dto.LeaderVoteState;
import org.example.codenames.gameSession.entity.dto.mapper.GameSessionMapper;
import org.example.codenames.gameSession.repository.api.GameSessionRepository;
import org.example.codenames.gameSession.service.api.GameSessionService;
import org.example.codenames.gameState.entity.GameState;
import org.example.codenames.gameState.service.api.GameStateService;
import org.example.codenames.socket.service.api.SocketService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

import static org.example.codenames.gameSession.entity.dto.mapper.GameSessionMapper.toJoinGameDTOList;
import static org.example.codenames.gameSession.entity.dto.mapper.GameSessionMapper.toRoomLobbyDTO;

/**
 * Default implementation of the GameSessionWebSocketController interface.
 * This class is responsible for handling WebSocket requests related to game sessions
 */
@AllArgsConstructor
@RestController
@RequestMapping("/api/game-session")
public class DefaultGameSessionWebSocketController implements GameSessionWebSocketController {

    private final GameSessionService gameSessionService;
    private final GameSessionRepository gameSessionRepository;
    private final GameStateService gameStateService;
    private final SocketService socketService;
    private final DiscordGuildService discordGuildService;

    /**
     * Clear all votes in the game session
     *
     * @param gameSession           the game session
     * @param gameSessionRepository the game session repository
     */
    public static void clearVotes(GameSession gameSession, GameSessionRepository gameSessionRepository) {
        List<Integer> zeroVotes = new ArrayList<>();
        int numberOfCards = gameSession.getGameState().getCards().length;

        for (int i = 0; i < numberOfCards; i++) {
            zeroVotes.add(0);
        }

        gameSession.getGameState().getCardsVotes().clear();
        gameSession.getGameState().setCardsVotes(zeroVotes);

        gameSessionRepository.save(gameSession);
    }

    @Override
    @PostMapping("/create-game")
    public ResponseEntity<Map<String, String>> createGameSession(@RequestBody CreateGameRequest request) throws JsonProcessingException {
        String gameId = gameSessionService.createGameSession(request);
        Map<String, String> response = new HashMap<>();
        response.put("gameId", gameId);
        socketService.sendGameSessionsList(GameSessionMapper.toJoinGameDTOList(gameSessionService.getAllGameSessions()));

        return ResponseEntity.ok(response);
    }

    @Override
    @GetMapping("/{gameId}/full")
    public ResponseEntity<GameSession> getGameSessionFull(@PathVariable String gameId) throws JsonProcessingException {
        GameSession gameSession = gameSessionService.getGameSessionById(UUID.fromString(gameId));

        if (gameSession != null) {
            socketService.sendGameSessionUpdate(UUID.fromString(gameId), gameSession);

            return ResponseEntity.ok(gameSession);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @Override
    @PostMapping("/{gameId}/connect")
    public ResponseEntity<Void> connectPlayer(@PathVariable UUID gameId, @RequestParam String userId, @RequestParam String teamIndex) {
        int teamIndexInt;

        try {
            teamIndexInt = Integer.parseInt(teamIndex);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }

        try {
            boolean added = gameSessionService.addPlayerToSession(gameId, userId, teamIndexInt);

            if (added) {
                socketService.sendGameSessionUpdate(gameId, toRoomLobbyDTO(gameSessionRepository.findBySessionId(gameId)));
                socketService.sendGameSessionsList(toJoinGameDTOList(gameSessionService.getAllGameSessions()));

                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.status(409).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @Override
    @DeleteMapping("/{gameId}/disconnect")
    public ResponseEntity<Void> disconnectPlayer(@PathVariable UUID gameId, @RequestParam String userId) {
        try {
            boolean removed = gameSessionService.removePlayerFromSession(gameId, userId);

            if (removed) {
                socketService.sendGameSessionUpdate(gameId, toRoomLobbyDTO(gameSessionRepository.findBySessionId(gameId)));
                socketService.sendGameSessionsList(toJoinGameDTOList(gameSessionService.getAllGameSessions()));

                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.status(404).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @Override
    @PostMapping("/{gameId}/start")
    public ResponseEntity<Void> startGame(@PathVariable UUID gameId) throws JsonProcessingException {
        GameSession gameSession = gameSessionRepository.findBySessionId(gameId)
                .orElseThrow(() -> new RuntimeException("Game with an ID of " + gameId + " does not exist."));

        gameSession.setStatus(GameSession.sessionStatus.LEADER_SELECTION);
        gameSession.setVotingStartTime(System.currentTimeMillis());

        String channelId = discordGuildService.createVoiceChannel(gameSession.getGameName(), gameSession.getMaxPlayers());
        gameSession.setDiscordChannelId(channelId);

        gameSessionRepository.save(gameSession);

        socketService.sendGameSessionUpdate(gameId, toRoomLobbyDTO(gameSessionRepository.findBySessionId(gameId)));
        socketService.sendGameSessionsList(toJoinGameDTOList(gameSessionService.getAllGameSessions()));

        return ResponseEntity.ok().build();
    }

    @Override
    @PostMapping("/{gameId}/finish")
    public ResponseEntity<Void> finishGame(@PathVariable UUID gameId) throws JsonProcessingException {
        GameSession gameSession = gameSessionRepository.findBySessionId(gameId)
                .orElseThrow(() -> new RuntimeException("Game with an ID of " + gameId + " does not exist."));

        // Set the game session status to finished
        gameSession.setStatus(GameSession.sessionStatus.FINISHED);

        discordGuildService.deleteChannel(gameSession.getDiscordChannelId());
        gameSession.setDiscordChannelId("");

        gameSessionRepository.save(gameSession);

        socketService.sendGameSessionUpdate(gameId, toRoomLobbyDTO(gameSessionRepository.findBySessionId(gameId)));

        return ResponseEntity.ok().build();
    }

    @Override
    @GetMapping("/all")
    public ResponseEntity<?> getGameSessions() {
        // Get all game sessions
        List<GameSession> gameSessions = gameSessionService.getAllGameSessions();

        if (gameSessions.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(toJoinGameDTOList(gameSessions));
    }

    @Override
    @PostMapping("/{gameId}/send-hint")
    public ResponseEntity<Void> sendHint(@PathVariable UUID gameId, @RequestBody HintRequest hintRequest) throws JsonProcessingException {
        GameSession gameSession = gameSessionRepository.findBySessionId(gameId).orElseThrow(() ->
                new IllegalArgumentException("Game with an ID of " + gameId + " does not exist."));
        GameState gameState = gameSession.getGameState();

        gameState.setHint(hintRequest.getHint());
        gameState.setHintNumber(hintRequest.getHintNumber());
        gameState.setInitialHintNumber(hintRequest.getInitialHintNumber());

        gameSessionRepository.save(gameSession);

        Optional<GameSession> optionalSession = gameSessionRepository.findBySessionId(gameId);

        if (optionalSession.isPresent()) {
            socketService.sendGameSessionUpdate(gameId, optionalSession.get());
        }

        return ResponseEntity.ok().build();
    }

    @Override
    @GetMapping("/{id}/change-turn")
    public ResponseEntity<?> changeTurn(@PathVariable UUID id) throws JsonProcessingException {
        gameStateService.changeTurn(id);

        GameSession gameSession = gameSessionRepository.findBySessionId(id).orElseThrow(() ->
                new IllegalArgumentException("Game with an ID of " + id + " does not exist."));

        clearVotes(gameSession, gameSessionRepository);

        socketService.sendGameSessionUpdate(id, gameSession);

        return ResponseEntity.ok("Turn changed");
    }

    @Override
    @PostMapping("/{gameId}/reveal-card")
    public ResponseEntity<?> revealCard(@PathVariable UUID gameId, @RequestBody String cardIndex) throws JsonProcessingException {
        gameSessionService.revealCard(gameId, cardIndex);

        GameSession gameSession = gameSessionRepository.findBySessionId(gameId).orElseThrow(() ->
                new IllegalArgumentException("Game with an ID of " + gameId + " does not exist."));

        socketService.sendGameSessionUpdate(gameId, gameSession);

        return ResponseEntity.ok("Card revealed.");
    }

    @Override
    @PostMapping("/{gameId}/vote")
    public ResponseEntity<?> submitVote(@PathVariable UUID gameId, @RequestBody VoteRequest voteRequest) throws JsonProcessingException {
        gameSessionService.submitVote(gameId, voteRequest.getUserId(), voteRequest.getVotedUserId());

        GameSession gameSession = gameSessionRepository.findBySessionId(gameId).orElseThrow(() ->
                new IllegalArgumentException("Game with an ID of " + gameId + " does not exist."));

        socketService.sendGameSessionUpdate(gameId, gameSession);

        return ResponseEntity.ok(voteRequest.getVotedUserId());
    }

    @Override
    @GetMapping("/{gameId}/vote-state")
    public ResponseEntity<LeaderVoteState> getVoteState(@PathVariable UUID gameId) {
        var response = gameSessionService.getLeaderVoteState(gameId);
        return response.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}