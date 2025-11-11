package org.example.codenames.gameSession.controller.api;

import org.example.codenames.gameSession.entity.dto.GameSessionRoomLobbyDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.UUID;

/**
 * Interface for the GameSessionController
 * This controller is responsible for handling requests related to the game session
 */
public interface GameSessionController {

    /**
     * Get game session by id
     *
     * @param gameId The id of the game session to retrieve
     * @return The game session with the specified id
     */
    ResponseEntity<GameSessionRoomLobbyDTO> getGameSession(@PathVariable String gameId);

    /**
     * Get states of cards in the game session
     *
     * @param gameId The id of the game session to retrieve
     * @return The states of cards in the game session
     */
    String[] getGameStateCards(@PathVariable UUID gameId);

    /**
     * Get the colors of cards in the game session
     *
     * @param gameId The id of the game session to retrieve
     * @return The colors of cards in the game session
     */
    Integer[] getGameStateCardsColors(@PathVariable UUID gameId);

    /**
     * Get the votes for leaders in the game session
     *
     * @param gameId The id of the game session
     * @return The votes for leaders
     */
    ResponseEntity<String> getVotes(@PathVariable UUID gameId);

    /**
     * Get users assigned to a team
     *
     * @param gameId    The id of the game session
     * @param teamIndex The index of the team
     * @return The votes for leaders
     */
    ResponseEntity<?> getUsersByTeam(@PathVariable String gameId, @RequestParam String teamIndex);

    /**
     * Authenticates password for a session.
     *
     * @param gameId          the id of the game session
     * @param enteredPassword password given by user
     * @return True if password is correct, false otherwise
     */
    ResponseEntity<?> authenticatePassword(@PathVariable String gameId, @PathVariable String enteredPassword);

    /**
     * Get connected users in the game session
     *
     * @param gameId The id of the game session
     * @return The connected users in the game session
     */
    ResponseEntity<?> getConnectedUsers(@PathVariable String gameId);
}
