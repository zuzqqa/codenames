package org.example.codenames.gameState.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.codenames.card.entity.Card;
import org.example.codenames.card.repository.CardRepository;
import org.example.codenames.user.entity.User;

import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class GameState {
    private User blueTeamLeader;
    private User redTeamLeader;

    private Integer blueTeamScore;
    private Integer redTeamScore;
    private Integer teamTurn = 1;

    private String[] cards;
    private Integer[] cardsColors;
    private List<Integer> cardsVotes;
    private List<Integer> cardsChoosen = new ArrayList<>();
    private String hint;
    private boolean isHintTurn;
    private boolean isGuessingTurn ;
}
