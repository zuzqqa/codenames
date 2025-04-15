package org.example.codenames.gameSession.entity;

import lombok.Data;

/**
 * HintRequest is a class that represents the request body of the hint endpoint.
 */
@Data
public class HintRequest {
    /**
     * The hint that the spymaster wants to give to their team.
     */
    private String hint;

    /**
     * Number of words
     */
    private int hintNumber;
}