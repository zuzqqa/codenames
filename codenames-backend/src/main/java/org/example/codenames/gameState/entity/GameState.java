package org.example.codenames.gameState.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.codenames.card.entity.Card;
import org.example.codenames.card.repository.CardRepository;
import org.example.codenames.user.entity.User;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@NoArgsConstructor
@Data
public class GameState {
    private User blueTeamLeader;
    private User redTeamLeader;

    private Integer blueTeamScore;
    private Integer redTeamScore;

    private String[] cards;
    private Integer[] cardsColors;

}
