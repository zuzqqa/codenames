package org.example.codenames.gameState.service.api;

import org.example.codenames.gameState.entity.GameState;

import java.util.List;
import java.util.UUID;

public interface GameStateService {
    void generateRandomCardsNames(GameState gameState);

    void generateRandomCardsColors(GameState gameState);

    void updateVotes(UUID id, List <Integer> selectedCards);

    void cardsChoosen(UUID gameId);
}
