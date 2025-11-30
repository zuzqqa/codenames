package org.example.codenames.gameSession.entity.dto.mapper;

import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.entity.dto.GameSessionJoinGameDTO;
import org.example.codenames.gameSession.entity.dto.GameSessionRoomLobbyDTO;

import java.util.List;
import java.util.Optional;

import static org.example.codenames.user.entity.mapper.UserMapper.toRoomLobbyDTOList;

/**
 * Mapper class for converting GameSession entities to various DTOs.
 */
public class GameSessionMapper {

    /**
     * Converts a GameSession entity to a GameSessionJoinGameDTO.
     *
     * @param session the GameSession entity to convert
     * @return a GameSessionJoinGameDTO containing the session's details
     */
    public static GameSessionJoinGameDTO toJoinGameDTO(GameSession session) {
        return GameSessionJoinGameDTO.builder()
                .status(session.getStatus())
                .sessionId(session.getSessionId())
                .gameName(session.getGameName())
                .maxPlayers(session.getMaxPlayers())
                .password(session.getPassword())
                .currentRedTeamPlayers(session.getConnectedUsers() != null ? session.getConnectedUsers().get(0).size() : 0)
                .currentBlueTeamPlayers(session.getConnectedUsers() != null ? session.getConnectedUsers().get(1).size() : 0)
                .build();
    }

    /**
     * Converts an Optional GameSession entity to a GameSessionRoomLobbyDTO.
     *
     * @param session the Optional GameSession entity to convert
     * @return a GameSessionRoomLobbyDTO containing the session's details,
     * or an empty DTO if the session is not present
     */
    public static GameSessionRoomLobbyDTO toRoomLobbyDTO(Optional<GameSession> session) {
        if (session.isPresent()) {
            GameSession gameSession = session.get();

            return GameSessionRoomLobbyDTO.builder()
                    .status(gameSession.getStatus())
                    .gameName(gameSession.getGameName())
                    .maxPlayers(gameSession.getMaxPlayers())
                    .connectedUsers(toRoomLobbyDTOList(gameSession.getConnectedUsers()))
                    .build();
        } else {
            return GameSessionRoomLobbyDTO.builder().build();
        }
    }

    /**
     * Converts a list of GameSession entities to a list of GameSessionJoinGameDTOs.
     *
     * @param sessions the list of GameSession entities to convert
     * @return a list of GameSessionJoinGameDTOs containing the sessions' details
     */
    public static List<GameSessionJoinGameDTO> toJoinGameDTOList(List<GameSession> sessions) {
        return sessions.stream()
                .map(GameSessionMapper::toJoinGameDTO)
                .toList();
    }
}
