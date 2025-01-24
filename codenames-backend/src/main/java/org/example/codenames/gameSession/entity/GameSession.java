package org.example.codenames.gameSession.entity;

import lombok.*;
import org.example.codenames.gameState.entity.GameState;
import org.example.codenames.user.entity.User;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Duration;
import java.util.List;
import java.util.UUID;
import jakarta.persistence.GeneratedValue;

@Document(collection = "sessions")
@AllArgsConstructor
@Getter
@Setter
@Builder
public class GameSession {
    public enum sessionStatus {
        CREATED,
        IN_PROGRESS,
        FINISHED
    }

    private sessionStatus status;

    @Id
    @GeneratedValue
    private UUID sessionId;

    private String gameName;
    private Integer maxPlayers;
    private Duration durationOfTheRound;
    private Duration timeForGuessing;
    private Duration timeForAHint;

    private Integer numberOfRounds;
    private List<List<User>> connectedUsers;
    private List<int[]> votes;
    private GameState gameState;
}
