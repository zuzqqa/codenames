package org.example.codenames.gameSession.service.api;

import org.example.codenames.gameSession.entity.CreateGameRequest;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.entity.VoteResult;
import org.example.codenames.user.entity.User;

import java.util.List;
import java.util.UUID;

public interface GameSessionService {
    public String createGameSession(CreateGameRequest request);

    public GameSession getGameSessionById(UUID gameId);

    public void updateStatus(UUID id, GameSession.sessionStatus sessionStatus);

    public void submitVote(UUID id, UUID userId, UUID votedUserId);

    public List<int[]> getVotes(UUID sessionId);

    void assignTeamLeaders(UUID sessionId);

    User findLeader(List<User> team, int[] teamVotes);
}
