package org.example.codenames.socket.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.socket.client.IO;
import io.socket.client.Socket;

import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.entity.dto.GameSessionJoinGameDTO;
import org.example.codenames.gameSession.entity.dto.GameSessionRoomLobbyDTO;
import org.example.codenames.socket.service.api.SocketService;

import org.springframework.stereotype.Service;

import java.net.URISyntaxException;
import java.util.List;
import java.util.UUID;

@Service
public class DefaultSocketService implements SocketService {

    private final Socket socket;

    public DefaultSocketService() throws URISyntaxException {
        socket = IO.socket("https://codenames-socket-io-server-35261654330.us-central1.run.app");

        socket.connect();
    }

    @Override
    public void sendGameSessionUpdate(UUID gameId, GameSessionRoomLobbyDTO gameSession) throws JsonProcessingException {
        if (socket.connected()) {
            ObjectMapper objectMapper = new ObjectMapper();
            String gameSessionJson = objectMapper.writeValueAsString(gameSession);

            socket.emit("gameSessionUpdate", gameId.toString(), gameSessionJson);
        }
    }

    @Override
    public void sendGameSessionsList(List<GameSessionJoinGameDTO> gameSessions) throws JsonProcessingException {
        if (socket.connected()) {
            ObjectMapper objectMapper = new ObjectMapper();
            String gameSessionJson = objectMapper.writeValueAsString(gameSessions);

            socket.emit("gameSessionsList", gameSessionJson);
        }
    }

    @Override
    public void sendGameSessionUpdate(UUID gameId, GameSession gameSession) throws JsonProcessingException {
        if (socket.connected()) {
            ObjectMapper objectMapper = new ObjectMapper();
            String gameSessionJson = objectMapper.writeValueAsString(gameSession);

            socket.emit("gameSessionData", gameId.toString(), gameSessionJson);
        }
    }
}
