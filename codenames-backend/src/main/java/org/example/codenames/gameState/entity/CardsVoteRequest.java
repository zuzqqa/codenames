package org.example.codenames.gameState.entity;

import lombok.Data;

@Data
public class CardsVoteRequest {

    private int cardIndex;
    private boolean addingVote;
}