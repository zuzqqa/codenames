package org.example.codenames.card.controller.api;

import org.example.codenames.card.entity.Card;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

/**
 * CardController interface
 */
public interface CardController {
    ResponseEntity<Card> getCardById(@PathVariable String id);

    ResponseEntity<Card> addCard(@RequestBody Card card);

    ResponseEntity<List<String>> getCardsInLanguage(@RequestParam String lang);
}
