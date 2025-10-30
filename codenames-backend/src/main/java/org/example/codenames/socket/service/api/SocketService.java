package org.example.codenames.socket.service.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.entity.dto.GameSessionJoinGameDTO;
import org.example.codenames.gameSession.entity.dto.GameSessionRoomLobbyDTO;

import java.util.List;
import java.util.UUID;

public interface SocketService {
    void sendGameSessionUpdate(UUID gameId, GameSessionRoomLobbyDTO gameSession) throws JsonProcessingException;

    void sendGameSessionsList(List<GameSessionJoinGameDTO> gameSessions) throws JsonProcessingException;

    void sendGameSessionUpdate(UUID gameId, GameSession gameSession) throws JsonProcessingException;
}
