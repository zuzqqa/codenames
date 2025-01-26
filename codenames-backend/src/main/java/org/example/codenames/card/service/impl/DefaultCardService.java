package org.example.codenames.card.service.impl;

import org.example.codenames.card.entity.Card;
import org.example.codenames.card.repository.CardRepository;
import org.example.codenames.card.service.api.CardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DefaultCardService implements CardService {

    private final CardRepository cardRepository;

    @Autowired
    public DefaultCardService(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    @Override
    public void createCard(Card card) {
        cardRepository.save(card);
    }

    @Override
    public Optional<Card> getCardById(String id) {
        return cardRepository.findById(id);
    }

    @Override
    public Optional<Card> getCardByName(String name) {
        return cardRepository.findByName(name);
    }

    @Override
    public List<Card> getAllCards() {
        return cardRepository.findAll();
    }

    @Override
    public Card updateCard(String id, Card updatedCard) {
        return cardRepository.findById(id)
                .map(card -> {
                    card.setName(updatedCard.getName());
                    return cardRepository.save(card);
                })
                .orElse(null);
    }

    @Override
    public void deleteCardById(String id) {
        cardRepository.deleteById(id);
    }
}
