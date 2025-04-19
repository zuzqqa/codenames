package org.example.codenames.gameState.service.api;

import org.example.codenames.card.entity.Card;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameState.entity.CardsVoteRequest;
import org.example.codenames.gameState.entity.GameState;

import java.util.UUID;

/**
 * Service for game state.
 */
public interface GameStateService {
    void generateRandomCardsNames(GameState gameState, String language);

    String getCardNameInLanguage(Card card, String language);

    void generateRandomCardsColors(GameState gameState);

    void updateVotes(UUID id, CardsVoteRequest voteRequest);

    void cardsChosen(GameSession gameSession, int cardIndex);

    int getTeamSize(GameSession gameSession);

    void toogleTurn(GameSession gameSession);

    void changeTurn(UUID gameId);

    void chooseRandomCurrentLeader(UUID gameId);
}
