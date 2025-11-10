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
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class DefaultSocketService implements SocketService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String socketServerUrl;
    private Socket gameSocket;
    private Socket profileSocket;
    private Socket chatSocket;

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
                .setReconnection(true)
                .setReconnectionAttempts(10)
                .setReconnectionDelay(1000)
                .build();

        gameSocket = IO.socket(socketServerUrl + "/game", options);
        gameSocket.on(Socket.EVENT_CONNECT, args -> log.info("[GAME SOCKET] Connected to /game namespace"));
        gameSocket.on(Socket.EVENT_CONNECT_ERROR, args -> log.error("[GAME SOCKET] Connection error: {}", args[0]));
        gameSocket.connect();

        profileSocket = IO.socket(socketServerUrl + "/profile", options);
        profileSocket.on(Socket.EVENT_CONNECT, args -> log.info("[PROFILE SOCKET] Connected to /profile namespace"));
        profileSocket.on(Socket.EVENT_CONNECT_ERROR, args -> log.error("[PROFILE SOCKET] Connection error: {}", args[0]));
        profileSocket.connect();

        IO.Options options1 = IO.Options.builder()
                .setTransports(new String[]{"websocket"})
                .build();
        chatSocket = IO.socket(socketServerUrl + "/chat", options1);
        chatSocket.on(Socket.EVENT_CONNECT, args -> log.info("[CHAT SOCKET] Connected to /chat namespace"));
        chatSocket.on(Socket.EVENT_CONNECT_ERROR, args -> log.error("[CHAT SOCKET] Connection error: {}", args[0]));
        chatSocket.connect();
    }

    /**
     * Sends a game session update to connected clients.
     *
     * @param gameId      The ID of the game session.
     * @param gameSession The game session data to send.
     * @throws JsonProcessingException if there is an error during JSON processing.
     */
    @Override
    public void sendGameSessionUpdate(UUID gameId, GameSessionRoomLobbyDTO gameSession) throws JsonProcessingException {
        if (gameSocket.connected()) {
            String gameSessionJson = objectMapper.writeValueAsString(gameSession);
            gameSocket.emit("gameSessionUpdate", gameId.toString(), gameSessionJson);
        } else {
            System.err.println("[SOCKET] Socket niepołączony – nie wysłano gameSessionUpdate");
        }
    }

    /**
     * Sends a list of game sessions to connected clients.
     *
     * @param gameSessions The list of game sessions to send.
     * @throws JsonProcessingException if there is an error during JSON processing.
     */
    @Override
    public void sendGameSessionsList(List<GameSessionJoinGameDTO> gameSessions) throws JsonProcessingException {
        if (gameSocket.connected()) {
            String gameSessionJson = objectMapper.writeValueAsString(gameSessions);
            gameSocket.emit("gameSessionsList", gameSessionJson);
        } else {
            System.err.println("[SOCKET] Socket niepołączony – nie wysłano gameSessionsList");
        }
    }

    /**
     * Sends a game session update to connected clients.
     *
     * @param gameId      The ID of the game session.
     * @param gameSession The game session data to send.
     * @throws JsonProcessingException if there is an error during JSON processing.
     */
    @Override
    public void sendGameSessionUpdate(UUID gameId, GameSession gameSession) throws JsonProcessingException {
        if (gameSocket.connected()) {
            String gameSessionJson = objectMapper.writeValueAsString(gameSession);
            gameSocket.emit("gameSessionData", gameId.toString(), gameSessionJson);
        } else {
            System.err.println("[SOCKET] Socket niepołączony – nie wysłano gameSessionData");
        }
    }

    @Override
    public void emitFriendRequestEvent(String senderUsername, String receiverUsername) throws JsonProcessingException {
        if (profileSocket.connected()) {
            Map<String, String> payload = Map.of("from", senderUsername, "to", receiverUsername);
            profileSocket.emit("sendFriendRequest", objectMapper.writeValueAsString(payload));
        } else {
            System.err.println("[SOCKET] Socket niepołączony – nie wysłano friendRequest");
        }
    }

    @Override
    public void emitFriendRequestDeclineEvent(String senderUsername, String receiverUsername) throws JsonProcessingException {
        if (profileSocket.connected()) {
            Map<String, String> payload = Map.of("from", senderUsername, "to", receiverUsername);
            profileSocket.emit("declineFriendRequest", objectMapper.writeValueAsString(payload));
        } else {
            System.err.println("[SOCKET] Socket niepołączony – nie wysłano friendRequest");
        }
    }

    @Override
    public void emitFriendRequestAcceptEvent(String senderUsername, String receiverUsername) throws JsonProcessingException {
        if (profileSocket.connected()) {
            Map<String, String> payload = Map.of("from", senderUsername, "to", receiverUsername);
            profileSocket.emit("acceptFriendRequest", objectMapper.writeValueAsString(payload));
        } else {
            System.err.println("[SOCKET] Socket niepołączony – nie wysłano friendRequest");
        }
    }

    @Override
    public void emitRemoveFriendEvent(String removerUsername, String removedUsername) throws JsonProcessingException {
        if (profileSocket.connected()) {
            Map<String, String> payload = Map.of("user", removerUsername, "friend", removedUsername);
            profileSocket.emit("removeFriend", objectMapper.writeValueAsString(payload));
        } else {
            System.err.println("[SOCKET] Socket niepołączony – nie wysłano removeFriend");
        }
    }

    /**
     * Sends a Discord link invite to connected clients.
     *
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
