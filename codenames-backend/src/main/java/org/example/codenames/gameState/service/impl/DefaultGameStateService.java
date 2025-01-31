package org.example.codenames.gameState.service.impl;

import org.example.codenames.card.entity.Card;
import org.example.codenames.card.repository.CardRepository;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.repository.api.GameSessionRepository;
import org.example.codenames.gameState.entity.GameState;
import org.example.codenames.gameState.service.api.GameStateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DefaultGameStateService implements GameStateService {

    private final CardRepository cardRepository;
    private final GameSessionRepository gameSessionRepository;

    @Autowired
    public DefaultGameStateService(CardRepository cardRepository, GameSessionRepository gameSessionRepository) {
        this.cardRepository = cardRepository;
        this.gameSessionRepository = gameSessionRepository;
    }

    public void generateRandomCardsNames(GameState gameState) {
        List<Card> allCards = cardRepository.findAll();

        Random random = new Random();
        List<Integer> selectedIndexes = new ArrayList<>();
        while (selectedIndexes.size() < 25) {
            int randomIndex = random.nextInt(allCards.size());
            if (!selectedIndexes.contains(randomIndex)) {
                selectedIndexes.add(randomIndex);
            }
        }

        String[] cards = new String[25];
        for (int i = 0; i < selectedIndexes.size(); i++) {
            cards[i] = allCards.get(selectedIndexes.get(i)).getName();
        }

        gameState.setCards(cards);
    }

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

    public int getTeamSize(GameSession gameSession) {
        return gameSession.getGameState().getTeamTurn();
    }
}
