package org.example.codenames.gameState.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.example.codenames.user.entity.User;
import org.example.codenames.user.entity.dto.UserRoomLobbyDTO;

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
    private UserRoomLobbyDTO blueTeamLeader;

    /**
     * Red team leader
     */
    private UserRoomLobbyDTO redTeamLeader;

    /**
     * Leader with privilege to select cards
     */
    private UserRoomLobbyDTO currentSelectionLeader;

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
     * Cards chosen to be revealed
     */
    private List<Integer> cardsChosen;

    /**
     * Hint
     */
    private String hint;

    /**
     * Hint number
     */
    private int hintNumber = 1;

    /**
     * Is hint turn
     */
    private boolean isHintTurn = true;

    /**
     * Is guessing turn
     */
    private boolean isGuessingTurn = false;
}
