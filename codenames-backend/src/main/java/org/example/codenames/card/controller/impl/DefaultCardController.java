package org.example.codenames.card.controller.impl;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.example.codenames.jwt.JwtService;
import org.example.codenames.card.entity.Card;
import org.example.codenames.card.controller.api.CardController;
import org.example.codenames.card.service.api.CardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cards")
public class DefaultCardController implements CardController {

    private final CardService cardService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<Void> createCard(@RequestBody Card card, HttpServletResponse response) {
        cardService.createCard(card);
        String token = jwtService.generateToken(card.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Card> getCardById(@PathVariable String id) {
        return cardService.getCardById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Card> getAllCards() {
        return cardService.getAllCards();
    }

    // Update a card by ID
    @PutMapping("/{id}")
    public ResponseEntity<Card> updateCard(@PathVariable String id, @RequestBody Card updatedCard) {
        Card card = cardService.updateCard(id, updatedCard);
        return card != null ? ResponseEntity.ok(card) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCardById(@PathVariable String id) {
        cardService.deleteCardById(id);
        return ResponseEntity.noContent().build();

    }


}
