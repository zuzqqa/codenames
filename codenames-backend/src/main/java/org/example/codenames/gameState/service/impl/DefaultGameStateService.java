package org.example.codenames.gameState.service.impl;

import org.example.codenames.card.entity.Card;
import org.example.codenames.card.repository.CardRepository;
import org.example.codenames.gameSession.controller.impl.DefaultGameSessionWebSocketController;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.repository.api.GameSessionRepository;
import org.example.codenames.gameState.entity.CardsVoteRequest;
import org.example.codenames.gameState.entity.GameState;
import org.example.codenames.gameState.service.api.GameStateService;

import org.example.codenames.user.entity.User;
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
     * @param card the card
     * @param language the language
     *
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
     * @param gameId the game session ID
     * @param voteRequest
     */
    @Override
    public void updateVotes(UUID gameId, CardsVoteRequest voteRequest) {
        GameSession gameSession = gameSessionRepository.findBySessionId(gameId).orElseThrow(() ->
                new IllegalArgumentException("Game with an ID of " + gameId + " does not exist."));
        GameState gameState = gameSession.getGameState();

        int cardIndex = voteRequest.getCardIndex();

        if (cardIndex >= 0 && cardIndex < gameState.getCardsVotes().size()) {
            int currentVotes = gameState.getCardsVotes().get(cardIndex);

            if (voteRequest.isAddingVote()) {
                gameState.getCardsVotes().set(cardIndex, currentVotes + 1);
            } else {
                gameState.getCardsVotes().set(cardIndex, Math.max(0, currentVotes - 1));
            }
        } else {
            throw new IllegalArgumentException("Incorrect card index: " + cardIndex);
        }

        gameSessionRepository.save(gameSession);
    }

    /**
     * Determines which cards have been chosen based on votes.
     *
     * @param gameSession the current game session
     * @param cardIndex the index of the card that was chosen
     */
    @Override
    public void cardsChosen(GameSession gameSession, int cardIndex) {
        GameState gameState = gameSession.getGameState();

        if(gameState.getCardsChosen() == null){
            gameState.setCardsChosen(new ArrayList<>());
        }

        gameState.getCardsChosen().add(cardIndex);
        gameState.setHintNumber(Math.max(0, gameState.getHintNumber() - 1));

        if(gameState.getCardsColors()[cardIndex] == 1){
            gameState.setRedTeamScore(gameState.getRedTeamScore() + 1);

            if (gameState.getTeamTurn() != 0) {
                this.toogleTurn(gameSession);
            }
        } else if(gameState.getCardsColors()[cardIndex] == 2){
            gameState.setBlueTeamScore(gameState.getBlueTeamScore() + 1);

            if (gameState.getTeamTurn() != 1) {
                this.toogleTurn(gameSession);
            }
        } else if(gameState.getCardsColors()[cardIndex] == 3){
            if (gameState.getTeamTurn() == 1) {
                gameState.setBlueTeamScore(100);
            } else {
                gameState.setRedTeamScore(100);
            }
        }

        if (gameState.getHintNumber() == 0) {
            this.toogleTurn(gameSession);
        }

        gameSessionRepository.save(gameSession);
    }

    /**
     * Gets the current team's turn.
     *
     * @param gameSession the game session
     *
     * @return the team turn index
     */
    @Override
    public int getTeamSize(GameSession gameSession) {
        return gameSession.getGameState().getTeamTurn();
    }

    @Override
    public void toogleTurn(GameSession gameSession) {
        GameState gameState = gameSession.getGameState();

        if (!gameState.isHintTurn()) {
            gameState.setTeamTurn((gameState.getTeamTurn() == 0) ? 1 : 0);
        }

        gameState.setHintTurn(!gameState.isHintTurn());
        gameState.setGuessingTurn(!gameState.isGuessingTurn());

        DefaultGameSessionWebSocketController.clearVotes(gameSession, gameSessionRepository);
    }

    /**
     * Changes the turn of the game session.
     *
     * @param gameId The UUID of the game session.
     */
    @Override
    public void changeTurn(UUID gameId) {
        GameSession gameSession = gameSessionRepository.findBySessionId(gameId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        this.toogleTurn(gameSession);

        this.chooseRandomCurrentLeader(gameId);
    }

    /**
     * Selects new turn leader.
     *
     * @param gameId The UUID of the game session.
     */
    @Override
    public void chooseRandomCurrentLeader(UUID gameId) {
        GameSession gameSession = gameSessionRepository.findBySessionId(gameId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        List<List<User>> connectedUsers = gameSession.getConnectedUsers();

        User newLeader = getNewLeader(gameSession, connectedUsers);

        gameSession.getGameState().setCurrentSelectionLeader(newLeader);
        gameSessionRepository.save(gameSession);
    }

    /**
     * Selects a new leader to select cards this round.
     *
     * @param gameSession the game session
     * @param connectedUsers the connected users to the game session
     *
     * @return the new leader
     */
    private static User getNewLeader(GameSession gameSession, List<List<User>> connectedUsers) {
        int currentTeamIndex = gameSession.getGameState().getTeamTurn();

        List<User> currentTeamPlayers = connectedUsers.get(currentTeamIndex);

        List<User> availablePlayers = new ArrayList<>(currentTeamPlayers);

        availablePlayers.remove(gameSession.getGameState().getRedTeamLeader());
        availablePlayers.remove(gameSession.getGameState().getBlueTeamLeader());

        Random rand = new Random();

        return availablePlayers.get(rand.nextInt(availablePlayers.size()));
    }
}
