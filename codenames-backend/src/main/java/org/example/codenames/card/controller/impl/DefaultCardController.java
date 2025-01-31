package org.example.codenames.card.controller.impl;

import org.example.codenames.card.controller.api.CardController;
import org.example.codenames.card.entity.Card;
import org.example.codenames.card.service.api.CardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cards")
public class DefaultCardController implements CardController {
    private final CardService cardService;

    @Autowired
    public DefaultCardController(CardService cardService) {
        this.cardService = cardService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Card> getCardById(@PathVariable String id) {
        Optional<Card> card = cardService.getCardById(id);
        return card.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/add")
    public ResponseEntity<Card> addCard(@RequestBody Card card) {
        Card savedCard = cardService.createCard(card);
        return ResponseEntity.ok(savedCard);
    }

    @GetMapping("/language")
    public ResponseEntity<List<String>> getCardsInLanguage(@RequestParam String lang) {
        List<String> cards = cardService.getCardsInLanguage(lang);
        return ResponseEntity.ok(cards);
    }
}
