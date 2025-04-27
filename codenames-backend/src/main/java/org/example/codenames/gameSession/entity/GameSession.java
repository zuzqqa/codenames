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
import org.springframework.data.redis.core.RedisHash;

/**
 * GameSession entity class.
 */
@RedisHash(value = "gameSession", timeToLive = 3600) // gameSession will expire after 60 minutes
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class GameSession {

    /**
     * Enum for session status.
     */
    public enum sessionStatus {
        CREATED,
        LEADER_SELECTION,
        IN_PROGRESS,
        FINISHED
    }

    /**
     * Game status.
     */
    private sessionStatus status;

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
     * List of connected users.
     */
    private List<List<User>> connectedUsers;

    /**
     * List of votes.
     */
    private List<List<Integer>> votes;

    /**
     * Game state.
     */
    private GameState gameState;

    /**
     * Voting start time.
     */
    private Long votingStartTime;
}
