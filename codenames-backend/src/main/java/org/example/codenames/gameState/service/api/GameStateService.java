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

    /**
     * Generates a set of random card names based on the selected language.
     *
     * @param gameState the game state to update
     * @param language  the language for the card names
     */
    void generateRandomCardsNames(GameState gameState, String language);

    /**
     * Returns the card name in the specified language.
     *
     * @param card     the card
     * @param language the language
     * @return the card name in the specified language
     */
    String getCardNameInLanguage(Card card, String language);

    /**
     * Generates and assigns random colors to the 25 cards.
     * 9 red, 8 blue, 1 assassin, and 7 neutral cards.
     *
     * @param gameState the game state to update
     */
    void generateRandomCardsColors(GameState gameState);

    /**
     * Updates vote counts for selected card.
     *
     * @param gameId      the game session ID
     * @param voteRequest the entity containing the cardIndex and whether the vote is an addition.
     */
    void updateVotes(UUID gameId, CardsVoteRequest voteRequest);

    /**
     * Determines which cards have been chosen based on votes.
     *
     * @param gameSession the current game session
     * @param cardIndex   the index of the card that was chosen
     */
    void cardsChosen(GameSession gameSession, int cardIndex);

    /**
     * Gets the current team's turn.
     *
     * @param gameSession the game session
     * @return the team turn index
     */
    int getTeamSize(GameSession gameSession);

    /**
     * Toggles the turn of the current game session, switching between the teams' turns,
     * the hint turn, and the guessing turn.
     *
     * @param gameSession the game session
     */
    void toogleTurn(GameSession gameSession);

    /**
     * Changes the turn of the game session.
     *
     * @param gameId The UUID of the game session.
     */
    void changeTurn(UUID gameId);

    /**
     * Selects new turn leader.
     *
     * @param gameId The UUID of the game session.
     */
    void chooseRandomCurrentLeader(UUID gameId);
}
