package org.example.codenames.gameSession.entity;

import lombok.Data;

/**
 * Class representing a vote request.
 */
@Data
public class VoteRequest {
    /**
     * The id of the user who is voting.
     */
    private String userId;

    /**
     * The id of the user chosen.
     */
    private String votedUserId;
}