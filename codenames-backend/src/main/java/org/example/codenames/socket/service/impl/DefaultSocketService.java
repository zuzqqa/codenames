package org.example.codenames.socket.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hazelcast.topic.Message;
import io.socket.client.IO;
import io.socket.client.Socket;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.example.codenames.chat.entity.ChatMessage;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.entity.dto.GameSessionJoinGameDTO;
import org.example.codenames.gameSession.entity.dto.GameSessionRoomLobbyDTO;
import org.example.codenames.socket.service.api.SocketService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URISyntaxException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class DefaultSocketService implements SocketService {
    /**
     * Object mapper for JSON serialization/deserialization.
     */
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * URL of the socket server.
     */
    private final String socketServerUrl;

    /**
     * Socket for game session updates.
     */
    private Socket gameSessionSocket;

    /**
     * Socket for chat messages.
     */
    private Socket chatSocket;

    /**
     * Constructor for DefaultSocketService.
     * 
     * @param socketServerUrl The URL of the socket server.
     */
    public DefaultSocketService(@Value("${socketServer.url}") String socketServerUrl) {
        this.socketServerUrl = socketServerUrl;
    }

    /**
     * Initializes the sockets after construction.
     * 
     * @throws URISyntaxException if the socket server URL is invalid.
     */
    @PostConstruct
    public void initializeSockets() throws URISyntaxException {
        IO.Options options = IO.Options.builder()
                .setTransports(new String[]{"websocket"})
                .build();

        gameSessionSocket = IO.socket(socketServerUrl + "/game", options);

        gameSessionSocket.on(Socket.EVENT_CONNECT, args -> {
            System.out.println("[SOCKET] Połączono z serwerem Socket.IO");
        });

        gameSessionSocket.on(Socket.EVENT_CONNECT_ERROR, args -> {
            System.err.println("[SOCKET] Błąd połączenia: " + args[0]);
        });

        gameSessionSocket.connect();

        IO.Options options1 = IO.Options.builder()
                .setTransports(new String[]{"websocket"})
                .build();

        chatSocket = IO.socket(socketServerUrl + "/chat", options1);

        chatSocket.on(Socket.EVENT_CONNECT, args -> {
            System.out.println("[SOCKET] Połączono z serwerem Socket.IO");
        });

        chatSocket.on(Socket.EVENT_CONNECT_ERROR, args -> {
            System.err.println("[SOCKET] Błąd połączenia: " + args[0]);
        });

        chatSocket.connect();
    }

    /**
     * Sends a game session update to connected clients.
     * @param gameId      The ID of the game session.
     * @param gameSession The game session data to send.
     * @throws JsonProcessingException if there is an error during JSON processing.
     */
    @Override
    public void sendGameSessionUpdate(UUID gameId, GameSessionRoomLobbyDTO gameSession) throws JsonProcessingException {
        if (gameSessionSocket.connected()) {
            String gameSessionJson = objectMapper.writeValueAsString(gameSession);
            gameSessionSocket.emit("gameSessionUpdate", gameId.toString(), gameSessionJson);
        } else {
            System.err.println("[SOCKET] Socket niepołączony – nie wysłano gameSessionUpdate");
        }
    }

    /**
     * Sends a list of game sessions to connected clients.
     * @param gameSessions The list of game sessions to send.
     * @throws JsonProcessingException if there is an error during JSON processing.
     */
    @Override
    public void sendGameSessionsList(List<GameSessionJoinGameDTO> gameSessions) throws JsonProcessingException {
        if (gameSessionSocket.connected()) {
            String gameSessionJson = objectMapper.writeValueAsString(gameSessions);
            gameSessionSocket.emit("gameSessionsList", gameSessionJson);
        } else {
            System.err.println("[SOCKET] Socket niepołączony – nie wysłano gameSessionsList");
        }
    }

    /**
     * Sends a game session update to connected clients.
     * @param gameId      The ID of the game session.
     * @param gameSession The game session data to send.
     * @throws JsonProcessingException if there is an error during JSON processing.
     */
    @Override
    public void sendGameSessionUpdate(UUID gameId, GameSession gameSession) throws JsonProcessingException {
        if (gameSessionSocket.connected()) {
            String gameSessionJson = objectMapper.writeValueAsString(gameSession);
            gameSessionSocket.emit("gameSessionData", gameId.toString(), gameSessionJson);
        } else {
            System.err.println("[SOCKET] Socket niepołączony – nie wysłano gameSessionData");
        }
    }

    /**
     * Sends a Discord link invite to connected clients.
     * @param gameId      The ID of the game session.
     * @param discordLink The Discord link to send.
     */
    @Override
    public void sendDiscordLinkInvite(UUID gameId, String discordLink) {
        Map<String, Object> msg = Map.of(
                "sender", "admin",
                "content", "Voice chat is now available! Join your teammates here: " + discordLink,
                "gameID", gameId.toString()
        );

        if (chatSocket.connected()) {
            chatSocket.emit("chatMessage", msg);
        } else {
            System.err.println("[SOCKET] Socket niepołączony – nie wysłano wiadomosci");
        }
    }
}
