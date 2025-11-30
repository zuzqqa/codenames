package org.example.codenames.gameSession.entity;

import jakarta.persistence.GeneratedValue;
import lombok.*;
import org.example.codenames.gameState.entity.GameState;
import org.example.codenames.user.entity.User;
import org.springframework.data.annotation.Id;

import java.util.List;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@ToString
public class GameSession {

    @Id
    @GeneratedValue
    private UUID sessionId;
    private sessionStatus status;
    private String gameName;
    private Integer maxPlayers;
    private String password;
    private List<List<User>> connectedUsers;
    private List<List<Integer>> votes;
    private GameState gameState;
    private Long votingStartTime;
    private String discordChannelId;
    public enum sessionStatus {
        CREATED,
        LEADER_SELECTION,
        IN_PROGRESS,
        FINISHED
    }
}
