package org.example.codenames.gameState.service.api;

import org.example.codenames.gameState.entity.GameState;

import java.util.UUID;

public interface GameStateService {
    void generateRandomCardsNames(GameState gameState);

    void generateRandomCardsColors(GameState gameState);

    void changeTurns(UUID gameId, Integer turn);
}
