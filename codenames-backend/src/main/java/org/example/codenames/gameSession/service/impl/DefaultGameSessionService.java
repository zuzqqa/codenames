package org.example.codenames.gameSession.service.impl;

import org.example.codenames.gameSession.entity.CreateGameRequest;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.repository.api.GameSessionRepository;
import org.example.codenames.gameSession.service.api.GameSessionService;
import org.example.codenames.gameState.entity.GameState;
import org.example.codenames.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class DefaultGameSessionService implements GameSessionService {

    private final GameSessionRepository gameSessionRepository;

    @Autowired
    public DefaultGameSessionService(GameSessionRepository gameSessionRepository) {
        this.gameSessionRepository = gameSessionRepository;
    }

    @Override
    public String createGameSession(CreateGameRequest request) {
        GameSession newGame = new GameSession(
                GameSession.sessionStatus.CREATED,
                UUID.randomUUID(),
                request.getGameName(),
                request.getMaxPlayers(),
                request.getDurationOfTheRound(),
                request.getTimeForGuessing(),
                request.getTimeForAHint(),
                request.getNumberOfRounds(),
                new ArrayList<List<User>>(),
                new ArrayList<int[]>(),
                new GameState()
        );

        gameSessionRepository.save(newGame);
        return newGame.getSessionId().toString();
    }


    @Override
    public GameSession getGameSessionById(UUID gameId) {
        if(gameSessionRepository.findBySessionId(gameId).isPresent()) {
            return gameSessionRepository.findBySessionId(gameId).get();
        }

        return null;
    }

    @Override
    public void updateStatus(UUID sessionId, GameSession.sessionStatus newStatus) {
        GameSession session = gameSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        session.setStatus(newStatus);
        gameSessionRepository.save(session);
    }

    @Override
    public void submitVote(UUID sessionId, UUID userId, UUID votedUserId) {
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

                session.getVotes().get(teamIndex)[votedIndex]++;
                gameSessionRepository.save(session);
                return;
            }
        }

        throw new RuntimeException("Voting user not found in any team");
    }

    @Override
    public List<int[]> getVotes(UUID sessionId) {
        GameSession session = gameSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        return session.getVotes();
    }

    @Override
    public void assignTeamLeaders(UUID sessionId) {
        GameSession session = gameSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        List<List<User>> teams = session.getConnectedUsers();
        List<int[]> votes = session.getVotes();

        if (teams.size() != 2 || votes.size() != 2) {
            throw new IllegalStateException("Expected exactly two teams for leader assignment.");
        }

        User blueTeamLeader = findLeader(teams.get(0), votes.get(0));
        User redTeamLeader = findLeader(teams.get(1), votes.get(1));

        // Create or update GameState with the leaders
        GameState gameState = session.getGameState();
        if (gameState == null) {
            gameState = new GameState();
            session.setGameState(gameState);
        }

        gameState.setBlueTeamLeader(blueTeamLeader);
        gameState.setRedTeamLeader(redTeamLeader);

        gameSessionRepository.save(session);
    }

    @Override
    public User findLeader(List<User> team, int[] teamVotes) {
        int maxVotes = -1;
        User leader = null;

        for (int i = 0; i < team.size(); i++) {
            if (teamVotes[i] > maxVotes) {
                maxVotes = teamVotes[i];
                leader = team.get(i);
            }
        }

        if (leader == null) {
            throw new RuntimeException("No leader could be determined.");
        }

        return leader;
    }
}

