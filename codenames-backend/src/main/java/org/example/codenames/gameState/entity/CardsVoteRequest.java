package org.example.codenames.gameState.entity;

import lombok.Data;

import java.util.List;

/**
 * Request to vote for cards
 */
@Data
public class CardsVoteRequest {
    /**
     * List of selected cards
     */
    private List<Integer> selectedCards;
}
