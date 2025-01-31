package org.example.codenames.card.service.api;

import org.example.codenames.card.entity.Card;
import java.util.List;
import java.util.Optional;

public interface CardService {
    Optional<Card> getCardById(String id);
    Card createCard(Card card);
    List<String> getCardsInLanguage(String language);
}
