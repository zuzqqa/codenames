package org.example.codenames.gameSession.entity.dto;

import lombok.Data;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.user.entity.dto.UserRoomLobbyDTO;

import java.util.List;

@Data
public class GameSessionRoomLobbyDTO {
    /**
     * Game status.
     */
    private GameSession.sessionStatus status;

    /**
     * Game name.
     */
    private String gameName;

    /**
     * Maximum number of players.
     */
    private Integer maxPlayers;

    /**
     * List of connected users.
     */
    List<List<UserRoomLobbyDTO>> connectedUsers;
}
