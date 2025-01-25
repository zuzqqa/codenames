package org.example.codenames.gameState.service.impl;

import org.example.codenames.card.entity.Card;
import org.example.codenames.card.repository.CardRepository;
import org.example.codenames.gameState.entity.GameState;
import org.example.codenames.gameState.service.api.GameStateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

@Service
public class DefaultGameStateService implements GameStateService {

    private final CardRepository cardRepository;

    @Autowired
    public DefaultGameStateService(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    public void generateRandomCardsNames(GameState gameState) {
        // Pobieramy wszystkie karty z repozytorium
        List<Card> allCards = cardRepository.findAll();

        // Tworzymy listę losowych indeksów
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

        for(int i=0; i<25; i++){
            System.out.println(cards[i]);
        }

        gameState.setCards(cards);
    }

    public void generateRandomCardsColors(GameState gameState) {
        List<Integer> cardColorsList = new ArrayList<>();

        // six blue cards
        for (int i = 0; i < 6; i++) {
            cardColorsList.add(1);
        }

        // six blue red
        for (int i = 0; i < 6; i++) {
            cardColorsList.add(2);
        }

        // one black card
        cardColorsList.add(3);
        for (int i = 0; i < 12; i++) {
            cardColorsList.add(0);
        }

        Collections.shuffle(cardColorsList);
        for(int i=0; i<25; i++){
            System.out.println(cardColorsList.get(i));
        }

        gameState.setCardsColors(cardColorsList.toArray(new Integer[0]));
    }
}
