package org.example.codenames.gameState.entity;

import lombok.Data;

/**
 * Request to vote for card
 */
@Data
public class CardsVoteRequest {
    private int cardIndex;
    private boolean addingVote;
}