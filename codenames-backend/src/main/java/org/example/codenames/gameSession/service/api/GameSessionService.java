package org.example.codenames.gameSession.service.api;

import org.example.codenames.gameSession.entity.CreateGameRequest;
import org.example.codenames.gameSession.entity.GameSession;

import java.util.UUID;

public interface GameSessionService {
    public String createGameSession(CreateGameRequest request);

    public GameSession getGameSessionById(UUID gameId);
}
