package org.example.codenames.gameSession.entity.dto;

import jakarta.persistence.GeneratedValue;

import lombok.Data;

import org.example.codenames.gameSession.entity.GameSession;

import org.springframework.data.annotation.Id;

import java.util.UUID;

@Data
public class GameSessionJoinGameDTO {
    /**
     * Game status.
     */
    private GameSession.sessionStatus status;

    /**
     * Game session id.
     */
    @Id
    @GeneratedValue
    private UUID sessionId;

    /**
     * Game name.
     */
    private String gameName;

    /**
     * Maximum number of players.
     */
    private Integer maxPlayers;

    /**
     * Password for private session.
     */
    private String password;

    /**
     * Number of players connected to the red team.
     */
    private int currentRedTeamPlayers;

    /**
     * Number of players connected to the blue team.
     */
    private int currentBlueTeamPlayers;
}
