package org.example.codenames.gameState.service.impl;

import org.example.codenames.card.entity.Card;
import org.example.codenames.card.repository.CardRepository;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.repository.GameSessionRepository;
import org.example.codenames.gameState.entity.GameState;
import org.example.codenames.gameState.service.api.GameStateService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Default implementation of the GameStateService.
 */
@Service
public class DefaultGameStateService implements GameStateService {
    /**
     * The repository for cards.
     */
    private final CardRepository cardRepository;

    /**
     * The repository for game sessions.
     */
    private final GameSessionRepository gameSessionRepository;

    /**
     * Constructs a new DefaultGameStateService.
     *
     * @param cardRepository the repository for cards
     * @param gameSessionRepository the repository for game sessions
     */
    @Autowired
    public DefaultGameStateService(CardRepository cardRepository, GameSessionRepository gameSessionRepository) {
        this.cardRepository = cardRepository;
        this.gameSessionRepository = gameSessionRepository;
    }

    /**
     * Generates a set of 25 random card names based on the selected language.
     *
     * @param gameState the game state to update
     * @param language  the language for the card names
     */
    public void generateRandomCardsNames(GameState gameState, String language) {
        List<Card> allCards = cardRepository.findAll();

        Random random = new Random();
        Set<Integer> selectedIndexes = new HashSet<>();

        // Select 25 random cards
        while (selectedIndexes.size() < 25) {
            selectedIndexes.add(random.nextInt(allCards.size()));
        }

        String[] cards = new String[25];
        int i = 0;

        for (Integer index : selectedIndexes) {
            Card card = allCards.get(index);
            String cardName = getCardNameInLanguage(card, language);
            cards[i++] = cardName;
        }

        gameState.setCards(cards);
    }

    /**
     * Returns the card name in the specified language.
     *
     * @param card     the card
     * @param language the language
     * @return the card name in the specified language
     */
    private String getCardNameInLanguage(Card card, String language) {
        if ("pl".equals(language)) {
            return card.getId();
        } else if ("en".equals(language)) {
            return card.getNames().getOrDefault("en", card.getId());
        }
        return card.getId();
    }

    /**
     * Generates and assigns random colors to the 25 cards.
     * 6 red, 6 blue, 1 assassin, and 12 neutral cards.
     *
     * @param gameState the game state to update
     */
    public void generateRandomCardsColors(GameState gameState) {
        List<Integer> cardColorsList = new ArrayList<>();

        for (int i = 0; i < 6; i++) {
            cardColorsList.add(1);
        }

        for (int i = 0; i < 6; i++) {
            cardColorsList.add(2);
        }

        cardColorsList.add(3);
        for (int i = 0; i < 12; i++) {
            cardColorsList.add(0);
        }

        Collections.shuffle(cardColorsList);

        gameState.setCardsColors(cardColorsList.toArray(new Integer[0]));
    }

    /**
     * Updates vote counts for selected cards.
     *
     * @param id            the game session ID
     * @param selectedCards list of selected card indexes
     */
    public void updateVotes(UUID id, List<Integer> selectedCards) {
        GameSession gameSession = gameSessionRepository.findBySessionId(id).orElse(null);
        if (gameSession == null) {
            throw new IllegalArgumentException("Nie znaleziono gry o podanym identyfikatorze.");
        }

        GameState gameState = gameSession.getGameState();

        for (Integer cardIndex : selectedCards) {
            if (cardIndex >= 0 && cardIndex < gameState.getCardsVotes().size()) {
                gameState.getCardsVotes().set(cardIndex, gameState.getCardsVotes().get(cardIndex) + 1);
            } else {
                throw new IllegalArgumentException("Nieprawidłowy indeks karty: " + cardIndex);
            }
        }

        gameSessionRepository.save(gameSession);
    }

    /**
     * Determines which cards have been chosen based on votes.
     *
     * @param gameSession the current game session
     */
    public void cardsChoosen(GameSession gameSession) {
        if (gameSession.getGameState().getCardsVotes().isEmpty()) {
            return;
        }

        int teamSize = gameSession.getConnectedUsers().get(getTeamSize(gameSession)).size() - 1 == 0 ? 1 : gameSession.getConnectedUsers().get(getTeamSize(gameSession)).size() - 1;

        if(gameSession.getGameState().getCardsChoosen() == null){
            gameSession.getGameState().setCardsChoosen(new ArrayList<>());
        }
        List<Integer> cardVotes = gameSession.getGameState().getCardsVotes();

        for (int i = 0; i < cardVotes.size(); i++) {
            if (cardVotes.get(i) == teamSize) {
                gameSession.getGameState().getCardsChoosen().add(i);
            }
        }

        List<Integer> zeroVotes = new ArrayList<>();
        int numberOfCards = gameSession.getGameState().getCards().length;
        for (int i = 0; i < numberOfCards; i++) {
            zeroVotes.add(0);
        }

        gameSession.getGameState().getCardsVotes().clear();
        gameSession.getGameState().setCardsVotes(zeroVotes);

        gameSessionRepository.save(gameSession);
    }

    /**
     * Gets the current team's turn.
     *
     * @param gameSession the game session
     * @return the team turn index
     */
    public int getTeamSize(GameSession gameSession) {
        return gameSession.getGameState().getTeamTurn();
    }
}
