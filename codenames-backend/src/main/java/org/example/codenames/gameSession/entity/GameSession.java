package org.example.codenames.gameSession.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import org.example.codenames.gameState.entity.GameState;
import org.example.codenames.user.entity.User;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Duration;
import java.util.List;
import java.util.UUID;
import jakarta.persistence.GeneratedValue;

/**
 * GameSession entity class.
 */
@Document(collection = "sessions")
@AllArgsConstructor
@Getter
@Setter
@Builder
public class GameSession {
    /**
     * Enum for session status.
     */
    public enum sessionStatus {
        CREATED,
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
     * Time for a hint.
     */
    private Duration timeForAHint;

    /**
     * Time for guessing.
     */
    private Duration timeForGuessing;

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
