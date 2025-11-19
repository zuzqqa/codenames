package org.example.codenames.gameSession.entity.dto;

import jakarta.persistence.GeneratedValue;
import lombok.Builder;
import lombok.Data;
import org.example.codenames.gameSession.entity.GameSession;
import org.springframework.data.annotation.Id;

import java.util.UUID;

@Data
@Builder
public class GameSessionJoinGameDTO {

    @Id
    @GeneratedValue
    private UUID sessionId;
    private GameSession.sessionStatus status;
    private String gameName;
    private Integer maxPlayers;
    private String password;
    private int currentRedTeamPlayers;
    private int currentBlueTeamPlayers;
}
