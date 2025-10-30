package org.example.codenames.socket.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.socket.client.IO;
import io.socket.client.Socket;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.entity.dto.GameSessionJoinGameDTO;
import org.example.codenames.gameSession.entity.dto.GameSessionRoomLobbyDTO;
import org.example.codenames.socket.service.api.SocketService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URISyntaxException;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class DefaultSocketService implements SocketService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String socketServerUrl;
    private Socket socket;

    public DefaultSocketService(@Value("${socketServer.url}") String socketServerUrl) {
        this.socketServerUrl = socketServerUrl;
    }

    @PostConstruct
    public void initializeSocket() throws URISyntaxException {
        IO.Options options = IO.Options.builder()
                .setTransports(new String[]{"websocket"})
                .build();

        socket = IO.socket(socketServerUrl, options);

        socket.on(Socket.EVENT_CONNECT, args -> {
            System.out.println("[SOCKET] Połączono z serwerem Socket.IO");
        });

        socket.on(Socket.EVENT_CONNECT_ERROR, args -> {
            System.err.println("[SOCKET] Błąd połączenia: " + args[0]);
        });

        socket.connect();
    }

    @Override
    public void sendGameSessionUpdate(UUID gameId, GameSessionRoomLobbyDTO gameSession) throws JsonProcessingException {
        if (socket.connected()) {
            String gameSessionJson = objectMapper.writeValueAsString(gameSession);
            socket.emit("gameSessionUpdate", gameId.toString(), gameSessionJson);
        } else {
            System.err.println("[SOCKET] Socket niepołączony – nie wysłano gameSessionUpdate");
        }
    }

    @Override
    public void sendGameSessionsList(List<GameSessionJoinGameDTO> gameSessions) throws JsonProcessingException {
        if (socket.connected()) {
            String gameSessionJson = objectMapper.writeValueAsString(gameSessions);
            socket.emit("gameSessionsList", gameSessionJson);
        } else {
            System.err.println("[SOCKET] Socket niepołączony – nie wysłano gameSessionsList");
        }
    }

    @Override
    public void sendGameSessionUpdate(UUID gameId, GameSession gameSession) throws JsonProcessingException {
        log.info(gameSession.getGameState().toString());
        if (socket.connected()) {
            String gameSessionJson = objectMapper.writeValueAsString(gameSession);
            socket.emit("gameSessionData", gameId.toString(), gameSessionJson);
        } else {
            System.err.println("[SOCKET] Socket niepołączony – nie wysłano gameSessionData");
        }
    }
}
