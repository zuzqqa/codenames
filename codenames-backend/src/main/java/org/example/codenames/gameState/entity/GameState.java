package org.example.codenames.gameState.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.example.codenames.user.entity.User;

import java.util.List;

/**
 * GameState entity
 */
@AllArgsConstructor
@NoArgsConstructor
@Data
public class GameState {
    /**
     * Blue team leader
     */
    private User blueTeamLeader;

    /**
     * Red team leader
     */
    private User redTeamLeader;

    /**
     * Blue team score
     */
    private Integer blueTeamScore;

    /**
     * Red team score
     */
    private Integer redTeamScore;

    /**
     * Team turn
     */
    private Integer teamTurn = 1;

    /**
     * Cards in the game
     */
    private String[] cards;

    /**
     * Cards colors
     */
    private Integer[] cardsColors;

    /**
     * Votes for cards
     */
    private List<Integer> cardsVotes;

    /**
     * Cards choosen to be revealed
     */
    private List<Integer> cardsChoosen;

    /**
     * Hint
     */
    private String hint;

    /**
     * Is hint turn
     */
    private boolean isHintTurn = true;

    /**
     * Is guessing turn
     */
    private boolean isGuessingTurn = false;

    /**
     * Change turn
     */
    public void toggleTurn() {
        if (!this.isHintTurn) {
            this.teamTurn = (this.teamTurn == 0) ? 1 : 0;
        }

        System.out.println(this.isHintTurn);
        System.out.println(this.teamTurn);
        System.out.println(this.isGuessingTurn);

        this.isHintTurn = !this.isHintTurn;
        this.isGuessingTurn = !this.isGuessingTurn;
    }
}
