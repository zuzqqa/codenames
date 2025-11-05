package org.example.codenames.gameSession.entity;

import jakarta.persistence.GeneratedValue;
import lombok.*;
import org.example.codenames.gameState.entity.GameState;
import org.example.codenames.user.entity.User;
import org.springframework.data.annotation.Id;

import java.util.List;
import java.util.UUID;

/**
 * GameSession entity class.
 */
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@ToString
public class GameSession {
    /**
     * Game status
     */
    private sessionStatus status;

    /**
     * Game session id
     */
    @Id
    @GeneratedValue
    private UUID sessionId;

    /**
     * Game name
     */
    private String gameName;

    /**
     * Maximum number of players
     */
    private Integer maxPlayers;

    /**
     * Password for private session
     */
    private String password;

    /**
     * List of connected users
     */
    private List<List<User>> connectedUsers;

    /**
     * List of votes
     */
    private List<List<Integer>> votes;

    /**
     * Game state
     */
    private GameState gameState;

    /**
     * Voting start time
     */
    private Long votingStartTime;

    /*
     * Discord channel id
     */
    private String discordChannelId;

    /**
     * Enum for session status
     */
    public enum sessionStatus {
        CREATED,
        LEADER_SELECTION,
        IN_PROGRESS,
        FINISHED
    }
}
