package org.example.codenames.gameSession.entity.dto;

import lombok.Builder;
import lombok.Data;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.user.entity.dto.UserRoomLobbyDTO;

import java.util.List;

@Data
@Builder
public class GameSessionRoomLobbyDTO {

    List<List<UserRoomLobbyDTO>> connectedUsers;
    private GameSession.sessionStatus status;
    private String gameName;
    private Integer maxPlayers;
}
