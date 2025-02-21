package org.example.codenames.gameSession.service.api;

import org.example.codenames.gameSession.entity.CreateGameRequest;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.user.entity.User;

import java.util.List;
import java.util.UUID;

public interface GameSessionService {
    String createGameSession(CreateGameRequest request);

    void updateVotingStartTime(UUID sessionId);

    GameSession getGameSessionById(UUID gameId);

    String[] getCardsBySessionId(UUID sessionId);

    Integer[] getCardsColorsBySessionId(UUID sessionId);

    void updateStatus(UUID id, GameSession.sessionStatus sessionStatus);

    void submitVote(UUID id, String userId, String votedUserId);

    List<List<Integer>> getVotes(UUID sessionId);

    void assignTeamLeaders(UUID sessionId);

    User findLeader(List<User> team, List<Integer> teamVotes);

    boolean addPlayerToSession(UUID sessionId, String userId, int teamIndex);

    List<GameSession> getAllGameSessions();

    boolean removePlayerFromSession(UUID gameId, String userId);
    void changeTurn(UUID gameId);
}
