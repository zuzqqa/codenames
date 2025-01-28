package org.example.codenames;

import lombok.RequiredArgsConstructor;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.repository.api.GameSessionRepository;
import org.example.codenames.gameState.service.api.GameStateService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.*;
@Component
@RequiredArgsConstructor
public class DynamicGameTurnScheduler {
    private final GameSessionRepository gameSessionRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(10);
    private final Map<UUID, ScheduledFuture<?>> gameTasks = new ConcurrentHashMap<>();
    private final GameStateService gameStateService;

    @PostConstruct
    public void initialize() {
        try {
            gameSessionRepository.findAllByStatus(GameSession.sessionStatus.IN_PROGRESS)
                    .forEach(gameSession -> {
                        scheduleGameTurns(gameSession);
                    });
        } catch (Exception e) {
            System.err.println("Błąd podczas inicjowania gier: ");
        }
    }

    public void scheduleGameTurns(GameSession gameSession) {
        UUID gameId = gameSession.getSessionId();
        cancelGameTurns(gameId);

        ScheduledFuture<?> scheduledTask = scheduler.scheduleAtFixedRate(() -> {
            try {
                GameSession updatedGame = gameSessionRepository.findBySessionId(gameId).orElseThrow(() ->
                        new IllegalArgumentException("Gra o ID " + gameId + " nie istnieje"));

                if (updatedGame.getGameState().isHintTurn()) {

                    updatedGame.getGameState().setHintTurn(false);
                    updatedGame.getGameState().setGuessingTurn(true);

                } else {
                    updatedGame.getGameState().setTeamTurn(1 - updatedGame.getGameState().getTeamTurn());
                    updatedGame.getGameState().setHintTurn(true);
                    updatedGame.getGameState().setGuessingTurn(false);
                }

                gameSessionRepository.save(updatedGame);
                gameStateService.cardsChoosen(gameId);

                messagingTemplate.convertAndSend("/game/" + gameId + "/timer", updatedGame);
            } catch (Exception e) {
                System.err.println("Błąd podczas zmiany tury dla gry: " + gameId);
            }
        }, 0, calculateNextTurnDuration(gameSession), TimeUnit.SECONDS);

        gameTasks.put(gameId, scheduledTask);
    }

    private long calculateNextTurnDuration(GameSession gameSession) {
        if (gameSession.getGameState().isHintTurn()) {
            // Zwróć czas dla tury wskazówek (Hint)
            return gameSession.getTimeForAHint().toSeconds();
        } else {
            // Zwróć czas dla tury odgadnięć (Guess)
            return gameSession.getTimeForGuessing().toSeconds();
        }
    }

    public void cancelGameTurns(UUID gameId) {
        ScheduledFuture<?> task = gameTasks.remove(gameId);
        if (task != null) {
            task.cancel(true);
        }
    }
}
