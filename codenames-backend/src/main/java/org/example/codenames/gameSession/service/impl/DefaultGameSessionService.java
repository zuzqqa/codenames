package org.example.codenames.gameSession.service.impl;

import org.example.codenames.gameSession.entity.CreateGameRequest;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.repository.api.GameSessionRepository;
import org.example.codenames.gameSession.service.api.GameSessionService;
import org.example.codenames.gameState.entity.GameState;
import org.example.codenames.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.UUID;

@Service
public class DefaultGameSessionService implements GameSessionService {

    private final GameSessionRepository gameSessionRepository;

    @Autowired
    public DefaultGameSessionService(GameSessionRepository gameSessionRepository) {
        this.gameSessionRepository = gameSessionRepository;
    }

    @Override
    public String createGameSession(CreateGameRequest request) {
        GameSession newGame = new GameSession(
                GameSession.sessionStatus.CREATED,
                UUID.randomUUID(),
                request.getGameName(),
                request.getMaxPlayers(),
                request.getDurationOfTheRound(),
                request.getTimeForGuessing(),
                request.getTimeForAHint(),
                request.getNumberOfRounds(),
                new ArrayList<User>()
        );

        gameSessionRepository.save(newGame);
        return newGame.getSessionId().toString();
    }


    @Override
    public GameSession getGameSessionById(UUID gameId) {
        if(gameSessionRepository.findBySessionId(gameId).isPresent()) {
            return gameSessionRepository.findBySessionId(gameId).get();
        }

        return null;
    }

    @Override
    public void updateStatus(UUID sessionId, GameSession.sessionStatus newStatus) {
        GameSession session = gameSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        session.setStatus(newStatus);
        gameSessionRepository.save(session);
    }
}

