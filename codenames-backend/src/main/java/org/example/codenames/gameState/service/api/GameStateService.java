package org.example.codenames.gameState.service.api;

import org.example.codenames.gameState.entity.GameState;

public interface GameStateService {

    public void generateRandomCardsNames(GameState gameState);
    public void generateRandomCardsColors(GameState gameState);
}
