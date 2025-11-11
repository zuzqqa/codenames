package org.example.codenames.gameSession.service.api;

import org.example.codenames.gameSession.entity.CreateGameRequest;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.entity.dto.LeaderVoteState;
import org.example.codenames.user.entity.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Game session service interface.
 */
public interface GameSessionService {

    /**
     * Creates a new game session.
     *
     * @param request The request containing game session details.
     * @return The unique identifier of the created game session.
     */
    String createGameSession(CreateGameRequest request);

    /**
     * Retrieves a game session by its unique identifier.
     *
     * @param gameId The UUID of the game session.
     * @return The {@link GameSession} if found, otherwise null.
     */
    GameSession getGameSessionById(UUID gameId);

    /**
     * Retrieves the cards for a given game session.
     *
     * @param sessionId The UUID of the game session.
     * @return An array of card names.
     * @throws IllegalArgumentException If the session is not found.
     * @throws IllegalStateException    If the game state is null.
     */
    String[] getCardsBySessionId(UUID sessionId);

    /**
     * Retrieves the card colors for a given game session.
     *
     * @param sessionId The UUID of the game session.
     * @return An array of card colors.
     */
    Integer[] getCardsColorsBySessionId(UUID sessionId);

    /**
     * Submits a vote for a user in a given session.
     *
     * @param sessionId   The UUID of the game session.
     * @param userId      The ID of the user submitting the vote.
     * @param votedUserId The ID of the user being voted for.
     * @throws RuntimeException If the session or voted user is not found.
     */
    void submitVote(UUID sessionId, String userId, String votedUserId);

    /**
     * Assigns team leaders based on the votes.
     *
     * @param sessionId The UUID of the game session.
     */
    void assignTeamLeaders(UUID sessionId);

    /**
     * Finds the leader of a team based on the votes.
     *
     * @param team      The team to find the leader for.
     * @param teamVotes The votes for each player in the team.
     * @return The leader of the team.
     */
    User findLeader(List<User> team, List<Integer> teamVotes);

    /**
     * Adds a player to a game session.
     *
     * @param sessionId The UUID of the game session.
     * @param userId    The ID of the user to add.
     * @param teamIndex The index of the team to add the user to.
     * @return True if the player was added, otherwise false.
     */
    boolean addPlayerToSession(UUID sessionId, String userId, int teamIndex);

    /**
     * Authenticates password for session.
     *
     * @param sessionId       The UUID of the game session.
     * @param enteredPassword The password given by user.
     * @return True if password is correct, otherwise false.
     */
    boolean authenticatePassword(UUID sessionId, String enteredPassword);

    /**
     * Retrieves all game sessions.
     *
     * @return A list of all game sessions.
     */
    List<GameSession> getAllGameSessions();

    /**
     * Removes a player from a game session.
     *
     * @param sessionId The UUID of the game session.
     * @param userId    The ID of the user to remove.
     * @return True if the player was removed, otherwise false.
     */
    boolean removePlayerFromSession(UUID sessionId, String userId);

    /**
     * Reveal a card.
     *
     * @param gameId    id of the game
     * @param cardIndex index of the card chosen
     */
    void revealCard(UUID gameId, String cardIndex);

    /**
     * Checks if a player is in a game session.
     *
     * @param gameId The UUID of the game session.
     * @param userId The ID of the user to check.
     * @return True if the player is in the session, otherwise false.
     */
    boolean isPlayerInSession(UUID gameId, String userId);

    /**
     * Get leader vote state.
     *
     * @param gameId id of the game
     * @return leader vote state if game with given param exists
     */
    Optional<LeaderVoteState> getLeaderVoteState(UUID gameId);
}

