package org.example.codenames.socket.service.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.entity.dto.GameSessionJoinGameDTO;
import org.example.codenames.gameSession.entity.dto.GameSessionRoomLobbyDTO;

import java.util.List;
import java.util.UUID;

/**
 * Service interface for handling socket communications related to game sessions and user interactions.
 */
public interface SocketService {

    /**
     * Sends an update about a specific game session to connected clients.
     *
     * @param gameId       the unique identifier of the game session
     * @param gameSession  the data transfer object containing the game session details
     * @throws JsonProcessingException if there is an error processing JSON
     */
    void sendGameSessionUpdate(UUID gameId, GameSessionRoomLobbyDTO gameSession) throws JsonProcessingException;

    /**
     * Sends a list of available game sessions to connected clients.
     *
     * @param gameSessions the list of game session data transfer objects
     * @throws JsonProcessingException if there is an error processing JSON
     */
    void sendGameSessionsList(List<GameSessionJoinGameDTO> gameSessions) throws JsonProcessingException;

    /**
     * Sends detailed information about a specific game session to connected clients.
     *
     * @param gameId       the unique identifier of the game session
     * @param gameSession  the game session entity containing detailed information
     * @throws JsonProcessingException if there is an error processing JSON
     */
    void sendGameSessionUpdate(UUID gameId, GameSession gameSession) throws JsonProcessingException;

    /**
     * Emits a friend request event to the specified receiver.
     *
     * @param receiverUsername the username of the user receiving the friend request
     * @param senderUsername   the username of the user sending the friend request
     * @throws JsonProcessingException if there is an error processing JSON
     */
    void emitFriendRequestEvent(String receiverUsername, String senderUsername) throws JsonProcessingException;

    /**
     * Emits a friend request decline event.
     *
     * @param receiverUsername the username of the user who declined the friend request
     * @param senderUsername   the username of the user who sent the friend request
     * @throws JsonProcessingException if there is an error processing JSON
     */
    void emitFriendRequestDeclineEvent(String receiverUsername, String senderUsername) throws JsonProcessingException;

    /**
     * Emits a friend request acceptance event.
     *
     * @param receiverUsername the username of the user who accepted the friend request
     * @param senderUsername   the username of the user who sent the friend request
     * @throws JsonProcessingException if there is an error processing JSON
     */
    void emitFriendRequestAcceptEvent(String receiverUsername, String senderUsername) throws JsonProcessingException;

    /**
     * Emits an event indicating that a friend has been removed.
     *
     * @param removerUsername the username of the user who removed the friend
     * @param removedUsername the username of the user who was removed
     * @throws JsonProcessingException if there is an error processing JSON
     */
    void emitRemoveFriendEvent(String removerUsername, String removedUsername) throws JsonProcessingException;

    /**
     * Sends a Discord link invite for a specific game session.
     *
     * @param gameId      the unique identifier of the game session
     * @param discordLink the Discord link invite to be sent
     * @throws JsonProcessingException if there is an error processing JSON
     */
    void sendDiscordLinkInvite(UUID gameId, String discordLink) throws JsonProcessingException;
}
