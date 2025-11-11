package org.example.codenames.gameState.controller.impl;

import org.example.codenames.card.service.api.CardService;
import org.example.codenames.gameState.controller.api.GameStateController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;


@RestController
@RequestMapping("/api/game-state")
public class DefaultGameStateController implements GameStateController {

    private final CardService cardService;

    public DefaultGameStateController(CardService cardService) {
        this.cardService = cardService;
    }

    @GetMapping("/{gameId}/get-cards")
    public ResponseEntity<List<String>> getCards(@PathVariable UUID gameId, @RequestParam String language) {
        List<String> cards = cardService.getCardsInLanguage(language);

        return ResponseEntity.ok(cards);
    }
}
