package org.example.codenames.unitTests;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.socket.client.Socket;
import org.example.codenames.gameSession.entity.dto.GameSessionJoinGameDTO;
import org.example.codenames.gameSession.entity.dto.GameSessionRoomLobbyDTO;
import org.example.codenames.socket.service.impl.DefaultSocketService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DefaultSocketServiceTest {

    DefaultSocketService service;

    @Mock
    Socket gameSocket;

    @Mock
    Socket chatSocket;

    @Mock
    GameSessionRoomLobbyDTO gameSessionDtoMock;

    @Mock
    GameSessionJoinGameDTO gameSessionJoinDtoMock;

    @BeforeEach
    void setUp() throws Exception {
        service = new DefaultSocketService("http://localhost:3000");

        Field gs = DefaultSocketService.class.getDeclaredField("gameSocket");
        gs.setAccessible(true);
        gs.set(service, gameSocket);

        Field cs = DefaultSocketService.class.getDeclaredField("chatSocket");
        cs.setAccessible(true);
        cs.set(service, chatSocket);
    }

    @Test
    void sendGameSessionUpdate_emitsWhenConnected() throws JsonProcessingException {
        when(gameSocket.connected()).thenReturn(true);

        service.sendGameSessionUpdate(UUID.randomUUID(), gameSessionDtoMock);

        verify(gameSocket, times(1)).emit(eq("gameSessionUpdate"), anyString(), anyString());
    }

    @Test
    void sendGameSessionsList_emitsWhenConnected() throws JsonProcessingException {
        when(gameSocket.connected()).thenReturn(true);

        service.sendGameSessionsList(List.of(gameSessionJoinDtoMock));

        verify(gameSocket, times(1)).emit(eq("gameSessionsList"), anyString());
    }

    @Test
    void sendDiscordLinkInvite_emitsWhenChatConnected() {
        when(chatSocket.connected()).thenReturn(true);

        service.sendDiscordLinkInvite(UUID.randomUUID(), "https://d.gg/abc");

        verify(chatSocket, times(1)).emit(eq("chatMessage"), any());
    }
}
