package org.example.codenames;

import org.example.codenames.gameSession.controller.impl.DefaultGameSessionController;
import org.example.codenames.gameSession.entity.CreateGameRequest;
import org.example.codenames.gameSession.service.api.GameSessionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DefaultGameSessionControllerTest {

    @Mock
    private GameSessionService gameSessionService;

    @InjectMocks
    private DefaultGameSessionController gameSessionController;

    @Test
    public void testCreateGameSession() {
        CreateGameRequest request = CreateGameRequest.builder()
                .gameName("Codenames")
                .maxPlayers(4)
                .durationOfTheRound(Duration.ofMinutes(2))
                .timeForGuessing(Duration.ofMinutes(1))
                .timeForAHint(Duration.ofSeconds(30))
                .numberOfRounds(5)
                .build();

        String gameId = "12345";
        when(gameSessionService.createGameSession(request)).thenReturn(gameId);

        ResponseEntity<Map<String, String>> response = gameSessionController.createGameSession(request);

        Map<String, String> expectedResponse = new HashMap<>();
        expectedResponse.put("gameId", gameId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedResponse, response.getBody());

        verify(gameSessionService, times(1)).createGameSession(request);
    }
}
