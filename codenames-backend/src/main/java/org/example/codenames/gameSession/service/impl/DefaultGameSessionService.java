package org.example.codenames.gameSession.service.impl;

import org.example.codenames.gameSession.entity.CreateGameRequest;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.repository.api.GameSessionRepository;
import org.example.codenames.gameSession.service.api.GameSessionService;
import org.example.codenames.gameState.entity.GameState;
import org.example.codenames.gameState.service.api.GameStateService;
import org.example.codenames.user.entity.User;
import org.example.codenames.user.service.api.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Default implementation of the {@link GameSessionService}.
 * Handles operations related to game sessions, such as creation, retrieval, and player management.
 */
@Service
public class DefaultGameSessionService implements GameSessionService {
    /**
     * Game session repository.
     */
    private final GameSessionRepository gameSessionRepository;

    /**
     * User service.
     */
    private final UserService userService;

    /**
     * Game state service.
     */
    private final GameStateService gameStateService;

    /**
     * Encoder used to securely hash and verify game session passwords,
     * preventing storage of plain-text passwords.
     */
    private final PasswordEncoder passwordEncoder;

    /**
     * Creates a new instance of the {@link DefaultGameSessionService}.
     *
     * @param gameSessionRepository Game session repository.
     * @param userService           User service.
     * @param gameStateService      Game state service.
     */
    @Autowired
    public DefaultGameSessionService(GameSessionRepository gameSessionRepository, UserService userService, GameStateService gameStateService, PasswordEncoder passwordEncoder) {
        this.gameSessionRepository = gameSessionRepository;
        this.userService = userService;
        this.gameStateService = gameStateService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Creates a new game session.
     *
     * @param request The request containing game session details.
     * @return The unique identifier of the created game session.
     */
    @Override
    public String createGameSession(CreateGameRequest request) {
        GameState gameState = new GameState();
        gameStateService.generateRandomCardsNames(gameState, request.getLanguage());
        gameStateService.generateRandomCardsColors(gameState);
        gameState.setTeamTurn(0);
        gameState.setBlueTeamScore(0);
        gameState.setRedTeamScore(0);

        List<Integer> cardsVotes = new ArrayList<>(Collections.nCopies(gameState.getCards().length, 0));

        gameState.setCardsVotes(cardsVotes);

        GameSession newGame = new GameSession(
                GameSession.sessionStatus.CREATED,
                UUID.randomUUID(),
                request.getGameName(),
                request.getMaxPlayers(),
                request.getPassword().isEmpty() ? "" :passwordEncoder.encode(request.getPassword()),
                new ArrayList<>() {{
                    add(new ArrayList<>());
                    add(new ArrayList<>());
                }},
                new ArrayList<>() {{
                    add(new ArrayList<>());
                    add(new ArrayList<>());
                }},
                gameState,
                System.currentTimeMillis()
        );

        gameSessionRepository.save(newGame);
        return newGame.getSessionId().toString();
    }

    /**
     * Retrieves a game session by its unique identifier.
     *
     * @param gameId The UUID of the game session.
     * @return The {@link GameSession} if found, otherwise null.
     */
    @Override
    public GameSession getGameSessionById(UUID gameId) {
        if(gameSessionRepository.findBySessionId(gameId).isPresent()) {
            return gameSessionRepository.findBySessionId(gameId).get();
        }

        return null;
    }

    /**
     * Retrieves the cards for a given game session.
     *
     * @param sessionId The UUID of the game session.
     * @return An array of card names.
     * @throws IllegalArgumentException If the session is not found.
     * @throws IllegalStateException If the game state is null.
     */
    @Override
    public String[] getCardsBySessionId(UUID sessionId) {
        return gameSessionRepository.findBySessionId(sessionId)
                .map(gameSession -> {
                    if (gameSession.getGameState() != null) {
                        return gameSession.getGameState().getCards();
                    }
                    throw new IllegalStateException("GameState is null for the given session.");
                })
                .orElseThrow(() -> new IllegalArgumentException("GameSession not found with ID: " + sessionId));
    }

    /**
     * Retrieves the card colors for a given game session.
     *
     * @param sessionId The UUID of the game session.
     * @return An array of card colors.
     */
    @Override
    public Integer[] getCardsColorsBySessionId(UUID sessionId) {
        return gameSessionRepository.findBySessionId(sessionId)
                .map(gameSession -> {
                    if (gameSession.getGameState() != null) {
                        return gameSession.getGameState().getCardsColors();
                    }
                    throw new IllegalStateException("GameState is null for the given session.");
                })
                .orElseThrow(() -> new IllegalArgumentException("GameSession not found with ID: " + sessionId));
    }

    /**
     * Submits a vote for a user in a given session.
     *
     * @param sessionId The UUID of the game session.
     * @param userId The ID of the user submitting the vote.
     * @param votedUserId The ID of the user being voted for.
     * @throws RuntimeException If the session or voted user is not found.
     */
    @Override
    public void submitVote(UUID sessionId, String userId, String votedUserId) {
        GameSession session = gameSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        for (int teamIndex = 0; teamIndex < session.getConnectedUsers().size(); teamIndex++) {
            List<User> team = session.getConnectedUsers().get(teamIndex);

            if (team.stream().anyMatch(user -> user.getId().equals(userId))) {
                int votedIndex = -1;
                for (int i = 0; i < team.size(); i++) {
                    if (team.get(i).getId().equals(votedUserId)) {
                        votedIndex = i;
                        break;
                    }
                }

                if (votedIndex == -1) {
                    throw new RuntimeException("Voted user not found in the team");
                }

                session.getVotes().get(teamIndex).set(votedIndex, session.getVotes().get(teamIndex).get(votedIndex) + 1);
                gameSessionRepository.save(session);
                return;
            }
        }
    }

    /**
     * Assigns team leaders based on the votes.
     *
     * @param sessionId The UUID of the game session.
     */
    @Override
    public void assignTeamLeaders(UUID sessionId) {
        GameSession session = gameSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        List<List<User>> teams = session.getConnectedUsers();
        List<List<Integer>> votes = session.getVotes();

        if (teams.size() != 2 || votes.size() != 2) {
            throw new IllegalStateException("Expected exactly two teams for leader assignment.");
        }

        User redTeamLeader = findLeader(teams.get(0), votes.get(0));
        User blueTeamLeader = findLeader(teams.get(1), votes.get(1));

        // Create or update GameState with the leaders
        GameState gameState = session.getGameState();

        gameState.setBlueTeamLeader(blueTeamLeader);
        gameState.setRedTeamLeader(redTeamLeader);

        gameSessionRepository.save(session);
    }

    /**
     * Finds the leader of a team based on the votes.
     *
     * @param team The team to find the leader for.
     * @param teamVotes The votes for each player in the team.
     *
     * @return The leader of the team.
     */
    @Override
    public User findLeader(List<User> team, List<Integer> teamVotes) {
        int maxVotes = -1;
        User leader = null;

        for (int i = 0; i < team.size(); i++) {
            if (teamVotes.get(i) > maxVotes) {
                maxVotes = teamVotes.get(i);
                leader = team.get(i);
            }
        }

        if (leader == null) {
            throw new RuntimeException("No leader could be determined.");
        }

        return leader;
    }

    /**
     * Adds a player to a game session.
     *
     * @param sessionId The UUID of the game session.
     * @param userId The ID of the user to add.
     * @param teamIndex The index of the team to add the user to.
     *
     * @return True if the player was added, otherwise false.
     */
    @Override
    public boolean addPlayerToSession(UUID sessionId, String userId, int teamIndex) {
        GameSession gameSession = getGameSessionById(sessionId);

        if (gameSession == null) {
            throw new IllegalArgumentException("Game session not found for ID: " + sessionId);
        }

        if (gameSession.getMaxPlayers() == gameSession.getConnectedUsers().stream().mapToInt(List::size).sum()){
            return false;
        }

        List<List<User>> connectedUsers = gameSession.getConnectedUsers();
        List<List<Integer>> votes = gameSession.getVotes();

        if (teamIndex < 0 || teamIndex >= connectedUsers.size()) {
            return false;
        }

        for(List<User> team : connectedUsers) {
            if (team.stream().anyMatch(user -> user.getId().equals(userId))) {
                return false;
            }
        }

        Optional<User> user = userService.getUserById(userId);
        User actualUser = user.orElseThrow(() -> new IllegalArgumentException("User not found for ID: " + userId));

        connectedUsers.get(teamIndex).add(actualUser);
        votes.get(teamIndex).add(0);

        gameSessionRepository.save(gameSession);

        return true;
    }

    /**
     * Authenticates password for session.
     *
     * @param sessionId The UUID of the game session.
     * @param enteredPassword The password given by user.
     *
     * @return True if password is correct, otherwise false.
     */
    @Override
    public boolean authenticatePassword(UUID sessionId, String enteredPassword) {
        GameSession gameSession = getGameSessionById(sessionId);

        if (gameSession == null) {
            throw new IllegalArgumentException("Game session not found for ID: " + sessionId);
        }

        return passwordEncoder.matches(enteredPassword, gameSession.getPassword());
    }

    /**
     * Retrieves all game sessions.
     *
     * @return A list of all game sessions.
     */
    @Override
    public List<GameSession> getAllGameSessions() {
        return gameSessionRepository.findAll();
    }

    /**
     * Removes a player from a game session.
     *
     * @param sessionId The UUID of the game session.
     * @param userId The ID of the user to remove.
     *
     * @return True if the player was removed, otherwise false.
     */
    @Override
    public boolean removePlayerFromSession(UUID sessionId, String userId) {
        GameSession gameSession = getGameSessionById(sessionId);

        if (gameSession == null) {
            throw new IllegalArgumentException("Game session not found for ID: " + sessionId);
        }

        List<List<User>> connectedUsers = gameSession.getConnectedUsers();

        if (connectedUsers == null || connectedUsers.isEmpty()) {
            return false;
        }

        boolean removed = false;
        // Remove the user from the first team that contains them
        for (List<User> team : connectedUsers) {
            if (team.removeIf(user -> user.getId().equals(userId))) {
                removed = true;
                break;
            }
        }

        var gameState = gameSession.getGameState();

        var redTeamPlayers = connectedUsers.get(0);

        var blueTeamPlayers = connectedUsers.get(1);

        if (gameState.getRedTeamLeader() != null && gameState.getRedTeamLeader().getId().equals(userId)) {
            gameState.setRedTeamLeader(redTeamPlayers.isEmpty() ? null : redTeamPlayers.get(0));
        }

        if (gameState.getBlueTeamLeader() != null && gameState.getBlueTeamLeader().getId().equals(userId)) {
            gameState.setBlueTeamLeader(blueTeamPlayers.isEmpty() ? null : blueTeamPlayers.get(0));
        }

        if (removed) {
            gameSession.setGameState(gameState);
            gameSessionRepository.save(gameSession);
        }

        return removed;
    }

    /**
     * Reveal a card.
     *
     * @param gameId id of the game
     * @param cardIndex index of the card chosen
     */
    @Override
    public void revealCard(UUID gameId, String cardIndex) {
        GameSession gameSession = gameSessionRepository.findBySessionId(gameId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        gameStateService.cardsChosen(gameSession, Integer.parseInt(cardIndex));

        gameSessionRepository.save(gameSession);
    }

    @Override
    public boolean isPlayerInSession(UUID gameId, String userId) {
        GameSession gameSession = gameSessionRepository.findBySessionId(gameId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        for (List<User> team : gameSession.getConnectedUsers()) {
            if (team.stream().anyMatch(user -> user.getId().equals(userId))) {
                return true;
            }
        }

        return false;
    }
}

