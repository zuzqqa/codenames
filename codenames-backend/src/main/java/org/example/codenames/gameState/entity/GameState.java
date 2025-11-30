package org.example.codenames.gameState.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.example.codenames.user.entity.User;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@ToString
public class GameState {

    private User blueTeamLeader;
    private User redTeamLeader;
    private User currentSelectionLeader;
    private Integer blueTeamScore;
    private Integer redTeamScore;
    private Integer teamTurn = 1;
    private String[] cards;
    private Integer[] cardsColors;
    private List<Integer> cardsVotes;
    private List<Integer> cardsChosen;
    private String hint;
    private int hintNumber = 1;
    private String initialHintNumber = "1";
    private boolean isHintTurn = true;
    private boolean isGuessingTurn = false;
}
