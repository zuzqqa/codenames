package org.example.codenames.gameSession.entity.dto;

import org.example.codenames.gameSession.entity.GameSession;

import java.util.List;
import java.util.Optional;

import static org.example.codenames.user.entity.dto.UserMapper.toRoomLobbyDTOList;

public class GameSessionMapper {
    public static GameSessionJoinGameDTO toJoinGameDTO(GameSession session) {
        GameSessionJoinGameDTO dto = new GameSessionJoinGameDTO();
        dto.setStatus(session.getStatus());
        dto.setSessionId(session.getSessionId());
        dto.setGameName(session.getGameName());
        dto.setMaxPlayers(session.getMaxPlayers());
        dto.setPassword(session.getPassword());
        dto.setCurrentRedTeamPlayers(session.getConnectedUsers() != null ? session.getConnectedUsers().get(0).size() : 0);
        dto.setCurrentBlueTeamPlayers(session.getConnectedUsers() != null ? session.getConnectedUsers().get(1).size() : 0);

        return dto;
    }

    public static GameSessionRoomLobbyDTO toRoomLobbyDTO(Optional<GameSession> session) {
        if (session.isPresent()) {
            GameSessionRoomLobbyDTO dto = new GameSessionRoomLobbyDTO();

            GameSession gameSession = session.get();

            dto.setStatus(gameSession.getStatus());
            dto.setGameName(gameSession.getGameName());
            dto.setMaxPlayers(gameSession.getMaxPlayers());
            dto.setConnectedUsers(toRoomLobbyDTOList(gameSession.getConnectedUsers()));

            return dto;
        } else {
            return new GameSessionRoomLobbyDTO();
        }
    }

    public static List<GameSessionJoinGameDTO> toJoinGameDTOList(List<GameSession> sessions) {
        return sessions.stream()
                .map(GameSessionMapper::toJoinGameDTO)
                .toList();
    }
}
