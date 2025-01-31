package org.example.codenames.gameState.service.api;

import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameState.entity.GameState;

import java.util.List;
import java.util.UUID;

public interface GameStateService {
    void generateRandomCardsNames(GameState gameState, String language);
    void generateRandomCardsColors(GameState gameState);
    void updateVotes(UUID id, List <Integer> selectedCards);
    void cardsChoosen(GameSession gameSession);
}
