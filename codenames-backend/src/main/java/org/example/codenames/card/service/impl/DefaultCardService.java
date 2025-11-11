package org.example.codenames.card.service.impl;

import org.example.codenames.card.entity.Card;
import org.example.codenames.card.repository.CardRepository;
import org.example.codenames.card.service.api.CardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DefaultCardService implements CardService {

    private final CardRepository cardRepository;

    @Autowired
    public DefaultCardService(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    @Override
    public Optional<Card> getCardById(String id) {
        return cardRepository.findById(id);
    }

    @Override
    public Card createCard(Card card) {
        return cardRepository.save(card);
    }

    @Override
    public List<String> getCardsInLanguage(String language) {
        if (language != null && !language.isEmpty()) {
            return cardRepository.findAll().stream()
                    .map(card -> card.getNames().getOrDefault(language, ""))
                    .filter(name -> !name.isEmpty())
                    .collect(Collectors.toList());
        } else {
            return List.of();
        }
    }
}
