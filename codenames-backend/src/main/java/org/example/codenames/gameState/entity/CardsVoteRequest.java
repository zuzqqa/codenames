package org.example.codenames.gameState.entity;

import lombok.Data;

import java.util.List;

@Data
public class CardsVoteRequest {
    private List<Integer> selectedCards;
}
