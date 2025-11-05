package org.example.codenames.gameSession.controller.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.AllArgsConstructor;
import org.example.codenames.discord.service.impl.DiscordGuildService;
import org.example.codenames.gameSession.controller.api.GameSessionWebSocketController;
import org.example.codenames.gameSession.entity.CreateGameRequest;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.entity.HintRequest;
import org.example.codenames.gameSession.entity.VoteRequest;
import org.example.codenames.gameSession.entity.dto.GameSessionMapper;
import org.example.codenames.gameSession.entity.dto.LeaderVoteState;
import org.example.codenames.gameSession.repository.api.GameSessionRepository;
import org.example.codenames.gameSession.service.api.GameSessionService;
import org.example.codenames.gameState.entity.GameState;
import org.example.codenames.gameState.service.api.GameStateService;
import org.example.codenames.socket.service.api.SocketService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import static org.example.codenames.gameSession.entity.dto.GameSessionMapper.toJoinGameDTOList;
import static org.example.codenames.gameSession.entity.dto.GameSessionMapper.toRoomLobbyDTO;

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
     * The GameSessionRepository instance used to interact with the game session database
     */
    private final GameSessionRepository gameSessionRepository;

    /**
     * The GameStateService instance used to interact with the game state
     */
    private final GameStateService gameStateService;

    /**
     * The SocketService instance used to send messages to connected clients
     */
    private final SocketService socketService;

    /**
     * The DiscordGuildService instance used to interact with the Discord guild
     */
    private final DiscordGuildService discordGuildService;

    /**
     * Clear all votes in the game session
     *
     * @param gameSession          the game session
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

    /**
     * Create a new game session
     *
     * @param request the request containing the game session information
     * @return the response entity containing the game session id
     */
    @PostMapping("/create-game")
    public ResponseEntity<Map<String, String>> createGameSession(@RequestBody CreateGameRequest request) throws JsonProcessingException {
        // Create a new game session
        String gameId = gameSessionService.createGameSession(request);
        Map<String, String> response = new HashMap<>();

        // Add the game id to the response
        response.put("gameId", gameId);

        // Send the game session to all clients
        socketService.sendGameSessionsList(GameSessionMapper.toJoinGameDTOList(gameSessionService.getAllGameSessions()));

        return ResponseEntity.ok(response);
    }

    /**
     * Get game session by id
     *
     * @param gameId The id of the game session to retrieve
     * @return The game session with the specified id
     */
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

    /**
     * Connect a player to a game session
     *
     * @param gameId    the game session id
     * @param userId    the user id
     * @param teamIndex the team index
     * @return the response entity
     */
    @PostMapping("/{gameId}/connect")
    public ResponseEntity<Void> connectPlayer(@PathVariable UUID gameId, @RequestParam String userId, @RequestParam String teamIndex) {
        int teamIndexInt;

        try {
            teamIndexInt = Integer.parseInt(teamIndex);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }

        try {
            // Add the player to the game session
            boolean added = gameSessionService.addPlayerToSession(gameId, userId, teamIndexInt);

            if (added) {
                // Send the game session to all clients
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

    /**
     * Disconnect a player from a game session
     *
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

    /**
     * Start the game 
     *
     * @param gameId the game session id
     * @return the response entity
     */
    @Override
    @PostMapping("/{gameId}/start")
    public ResponseEntity<Void> startGame(@PathVariable UUID gameId) throws JsonProcessingException {
        // Set the game session status to leader selection
        GameSession gameSession = gameSessionRepository.findBySessionId(gameId)
                .orElseThrow(() -> new RuntimeException("Game with an ID of " + gameId + " does not exist."));

        gameSession.setStatus(GameSession.sessionStatus.LEADER_SELECTION);
        gameSession.setVotingStartTime(System.currentTimeMillis());

        String channelId = discordGuildService.createVoiceChannel(gameSession.getGameName(), gameSession.getMaxPlayers());
        gameSession.setDiscordChannelId(channelId);

        gameSessionRepository.save(gameSession);

        // Send the game session to all clients
        socketService.sendGameSessionUpdate(gameId, toRoomLobbyDTO(gameSessionRepository.findBySessionId(gameId)));
        socketService.sendGameSessionsList(toJoinGameDTOList(gameSessionService.getAllGameSessions()));


        return ResponseEntity.ok().build();
    }

    /**
     * Finish the game
     *
     * @param gameId the game session id
     * @throws JsonProcessingException if there is an error processing JSON
     * 
     * @return the response entity
     */
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

    /**
     * Get game sessions
     *
     * @return the response entity containing the list of game sessions
     */
    @GetMapping("/all")
    public ResponseEntity<?> getGameSessions() {
        // Get all game sessions
        List<GameSession> gameSessions = gameSessionService.getAllGameSessions();

        if (gameSessions.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(toJoinGameDTOList(gameSessions));
    }

    /**
     * Send hints to the players
     *
     * @param gameId      the game session id
     * @param hintRequest the hint request containing the hint information
     * @throws JsonProcessingException if there is an error processing JSON
     * 
     * @return the response entity
     */
    @PostMapping("/{gameId}/send-hint")
    public ResponseEntity<Void> sendHint(@PathVariable UUID gameId, @RequestBody HintRequest hintRequest) throws JsonProcessingException {
        GameSession gameSession = gameSessionRepository.findBySessionId(gameId).orElseThrow(() ->
                new IllegalArgumentException("Game with an ID of " + gameId + " does not exist."));
        GameState gameState = gameSession.getGameState();

        // Set the hint for the game session
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

    /**
     * Change the turn
     *
     * @param id the game session id
     * @throws JsonProcessingException if there is an error processing JSON
     * 
     * @return the response entity
     */
    @GetMapping("/{id}/change-turn")
    public ResponseEntity<?> changeTurn(@PathVariable UUID id) throws JsonProcessingException {
        // Change the turn
        gameStateService.changeTurn(id);

        GameSession gameSession = gameSessionRepository.findBySessionId(id).orElseThrow(() ->
                new IllegalArgumentException("Game with an ID of " + id + " does not exist."));


        clearVotes(gameSession, gameSessionRepository);

        socketService.sendGameSessionUpdate(id, gameSession);

        return ResponseEntity.ok("Turn changed");
    }

    /**
     * Reveal card chosen by the currentSelectionLeader
     *
     * @param gameId    the id of the game session
     * @param cardIndex index of the card to be revealed
     * @throws JsonProcessingException if there is an error processing JSON
     * 
     * @return response entity
     */
    @Override
    @PostMapping("/{gameId}/reveal-card")
    public ResponseEntity<?> revealCard(@PathVariable UUID gameId, @RequestBody String cardIndex) throws JsonProcessingException {
        gameSessionService.revealCard(gameId, cardIndex);

        GameSession gameSession = gameSessionRepository.findBySessionId(gameId).orElseThrow(() ->
                new IllegalArgumentException("Game with an ID of " + gameId + " does not exist."));


        socketService.sendGameSessionUpdate(gameId, gameSession);

        return ResponseEntity.ok("Card revealed.");
    }

    /**
     * Submit a vote for a leader
     *
     * @param gameId      the id of the game session
     * @param voteRequest the vote request containing the user id and the id of the user that was voted on
     * @throws JsonProcessingException if there is an error processing JSON
     * 
     * @return the id of the user that was voted on
     */
    @Override
    @PostMapping("/{gameId}/vote")
    public ResponseEntity<?> submitVote(@PathVariable UUID gameId, @RequestBody VoteRequest voteRequest) throws JsonProcessingException {
        // Submit vote
        gameSessionService.submitVote(gameId, voteRequest.getUserId(), voteRequest.getVotedUserId());

        GameSession gameSession = gameSessionRepository.findBySessionId(gameId).orElseThrow(() ->
                new IllegalArgumentException("Game with an ID of " + gameId + " does not exist."));

        socketService.sendGameSessionUpdate(gameId, gameSession);

        return ResponseEntity.ok(voteRequest.getVotedUserId());
    }

    /**
     * Get the current vote state for leader selection
     * @param gameId
     * @return the leader vote state
     */
    @Override
    @GetMapping("/{gameId}/vote-state")
    public ResponseEntity<LeaderVoteState> getVoteState(@PathVariable UUID gameId) {
        var response = gameSessionService.getLeaderVoteState(gameId);
        return response.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}