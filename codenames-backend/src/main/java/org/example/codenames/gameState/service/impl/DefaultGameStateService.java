package org.example.codenames.gameState.service.impl;

import org.example.codenames.card.entity.Card;
import org.example.codenames.card.repository.CardRepository;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.repository.api.GameSessionRepository;
import org.example.codenames.gameState.entity.CardsVoteRequest;
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
    @Override
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
    @Override
    public String getCardNameInLanguage(Card card, String language) {
        if ("pl".equals(language)) {
            return card.getId();
        } else if ("en".equals(language)) {
            return card.getNames().getOrDefault("en", card.getId());
        }
        return card.getId();
    }

    /**
     * Generates and assigns random colors to the 25 cards.
     * 9 red, 8 blue, 1 assassin, and 7 neutral cards.
     *
     * @param gameState the game state to update
     */
    // TODO: Method uses hardcoded values for number of cards, consider using constants or configuration
    @Override
    public void generateRandomCardsColors(GameState gameState) {
        List<Integer> cardColorsList = new ArrayList<>();
        int numberOfBlueCards = 8;
        int numberOfRedCards = 9;
        for (int i = 0; i < numberOfRedCards; i++) {
            cardColorsList.add(1);
        }

        for (int i = 0; i < numberOfBlueCards; i++) {
            cardColorsList.add(2);
        }
        // Adding neutral cards
        cardColorsList.add(3);
        for (int i = 0; i < 25 - (numberOfRedCards + numberOfBlueCards); i++) {
            cardColorsList.add(0);
        }

        Collections.shuffle(cardColorsList);

        gameState.setCardsColors(cardColorsList.toArray(new Integer[0]));
    }

    /**
     * Updates vote counts for selected card.
     *
     * @param id the game session ID
     * @param voteRequest
     */
    @Override
    public void updateVotes(UUID id, CardsVoteRequest voteRequest) {
        GameSession gameSession = gameSessionRepository.findBySessionId(id).orElse(null);

        if (gameSession == null) {
            throw new IllegalArgumentException("The game ID provided was not found.");
        }

        GameState gameState = gameSession.getGameState();
        int index = voteRequest.getIndex();
        System.out.println(voteRequest.isAddingVote());

        if (index >= 0 && index < gameState.getCardsVotes().size()) {
            int currentVotes = gameState.getCardsVotes().get(index);

            if (voteRequest.isAddingVote()) {
                gameState.getCardsVotes().set(index, currentVotes + 1);
            } else {
                gameState.getCardsVotes().set(index, Math.max(0, currentVotes - 1));
            }
        } else {
            throw new IllegalArgumentException("Nieprawidłowy indeks karty: " + index);
        }

        gameSessionRepository.save(gameSession);
    }

    /**
     * Determines which cards have been chosen based on votes.
     *
     * @param gameSession the current game session
     */
    @Override
    public void cardsChosen(GameSession gameSession) {
        if (gameSession.getGameState().getCardsVotes().isEmpty()) {
            return;
        }

        int teamSize = gameSession.getConnectedUsers().get(getTeamSize(gameSession)).size() - 1 == 0 ? 1 : gameSession.getConnectedUsers().get(getTeamSize(gameSession)).size() - 1;

        if(gameSession.getGameState().getCardsChosen() == null){
            gameSession.getGameState().setCardsChosen(new ArrayList<>());
        }
        List<Integer> cardVotes = gameSession.getGameState().getCardsVotes();

        for (int i = 0; i < cardVotes.size(); i++) {
            if (cardVotes.get(i) == teamSize) {
                gameSession.getGameState().getCardsChosen().add(i);

                if(gameSession.getGameState().getCardsColors()[i] == 1){
                    gameSession.getGameState().setRedTeamScore(gameSession.getGameState().getRedTeamScore() + 1);
                } else if(gameSession.getGameState().getCardsColors()[i] == 2){
                    gameSession.getGameState().setBlueTeamScore(gameSession.getGameState().getBlueTeamScore() + 1);
                } else if(gameSession.getGameState().getCardsColors()[i] == 3){
                    if (gameSession.getGameState().getTeamTurn() == 1) {
                        gameSession.getGameState().setBlueTeamScore(100);
                    } else {
                        gameSession.getGameState().setRedTeamScore(100);
                    }
                }
            }
        }

        gameSessionRepository.save(gameSession);
    }

    /**
     * Gets the current team's turn.
     *
     * @param gameSession the game session
     * @return the team turn index
     */
    @Override
    public int getTeamSize(GameSession gameSession) {
        return gameSession.getGameState().getTeamTurn();
    }

//    @Override
//    public void startRevealingPhase(UUID id) {
//        GameSession gameSession = gameSessionRepository.findBySessionId(id)
//                .orElseThrow(() -> new RuntimeException("Session not found"));
//        GameState gameState = gameSession.getGameState();
//
//        gameState.getCardsVotes().clear();
//
//        gameState.toggleSelectionTurn();
//    }
}
