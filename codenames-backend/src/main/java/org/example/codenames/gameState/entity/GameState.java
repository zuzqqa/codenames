package org.example.codenames.gameState.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.codenames.user.entity.User;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class GameState {
    private User blueTeamLeader;
    private User redTeamLeader;

    private Integer blueTeamScore;
    private Integer redTeamScore;
    private Integer teamTurn;

    private String hint;
}
