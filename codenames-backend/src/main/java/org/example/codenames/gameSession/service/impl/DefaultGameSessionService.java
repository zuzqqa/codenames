package org.example.codenames.gameSession.service.impl;

import org.example.codenames.card.service.api.CardService;
import org.example.codenames.gameSession.entity.CreateGameRequest;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.repository.api.GameSessionRepository;
import org.example.codenames.gameSession.service.api.GameSessionService;
import org.example.codenames.gameState.entity.GameState;
import org.example.codenames.gameState.service.api.GameStateService;
import org.example.codenames.user.entity.User;
import org.example.codenames.user.service.api.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DefaultGameSessionService implements GameSessionService {

    private final GameSessionRepository gameSessionRepository;
    private final UserService userService;
    private final GameStateService gameStateService;

    @Autowired
    public DefaultGameSessionService(GameSessionRepository gameSessionRepository, UserService userService, GameStateService gameStateService) {
        this.gameSessionRepository = gameSessionRepository;
        this.userService = userService;
        this.gameStateService = gameStateService;
    }

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
                request.getTimeForAHint(),
                request.getTimeForGuessing(),
                new ArrayList<List<User>>() {{
                    add(new ArrayList<>());
                    add(new ArrayList<>());
                }},
                new ArrayList<List<Integer>>() {{
                    add(new ArrayList<>());
                    add(new ArrayList<>());
                }},
                gameState,
                System.currentTimeMillis()
        );

        gameSessionRepository.save(newGame);
        return newGame.getSessionId().toString();
    }

    @Override
    public void updateVotingStartTime(UUID sessionId) {
        GameSession session = gameSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        session.setVotingStartTime(System.currentTimeMillis());
        gameSessionRepository.save(session);
    }

    @Override
    public GameSession getGameSessionById(UUID gameId) {
        if(gameSessionRepository.findBySessionId(gameId).isPresent()) {
            return gameSessionRepository.findBySessionId(gameId).get();
        }

        return null;
    }

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

    @Override
    public void updateStatus(UUID sessionId, GameSession.sessionStatus newStatus) {
        GameSession session = gameSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        session.setStatus(newStatus);
        gameSessionRepository.save(session);
    }

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

    @Override
    public List<List<Integer>> getVotes(UUID sessionId) {
        GameSession session = gameSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        return session.getVotes();
    }

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
        if (connectedUsers == null) {
            connectedUsers = List.of(new ArrayList<>(), new ArrayList<>());
            votes = List.of(new ArrayList<>(), new ArrayList<>());
            gameSession.setConnectedUsers(connectedUsers);
            gameSession.setVotes(votes);
        }

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

    @Override
    public List<GameSession> getAllGameSessions() {
        return gameSessionRepository.findAll();
    }

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

        for (List<User> team : connectedUsers) {
            if (team.removeIf(user -> user.getId().equals(userId))) {
                removed = true;
                break;
            }
        }

        if (removed) {
            gameSessionRepository.save(gameSession);
        }

        return removed;
    }


    public void changeTurn(UUID gameId) {
        GameSession gameSession = gameSessionRepository.findBySessionId(gameId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        GameState gameState = gameSession.getGameState();
        gameState.toggleTurn();
        gameStateService.cardsChoosen(gameSession);
        gameSessionRepository.save(gameSession);
    }
}

