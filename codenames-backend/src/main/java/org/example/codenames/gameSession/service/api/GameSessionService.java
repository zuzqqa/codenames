package org.example.codenames.gameSession.service.api;

import org.example.codenames.gameSession.entity.CreateGameRequest;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.user.entity.User;

import java.util.List;
import java.util.UUID;

/**
 * Game session service interface.
 */
public interface GameSessionService {
    String createGameSession(CreateGameRequest request);

    GameSession getGameSessionById(UUID gameId);

    String[] getCardsBySessionId(UUID sessionId);

    Integer[] getCardsColorsBySessionId(UUID sessionId);

    void submitVote(UUID id, String userId, String votedUserId);

    void assignTeamLeaders(UUID sessionId);

    User findLeader(List<User> team, List<Integer> teamVotes);

    boolean addPlayerToSession(UUID sessionId, String userId, int teamIndex);

    boolean authenticatePassword(UUID sessionId, String password);

    List<GameSession> getAllGameSessions();

    boolean removePlayerFromSession(UUID gameId, String userId);

    void revealCard(UUID gameId, String cardIndex);

    boolean isPlayerInSession(UUID gameId, String userId);
}
