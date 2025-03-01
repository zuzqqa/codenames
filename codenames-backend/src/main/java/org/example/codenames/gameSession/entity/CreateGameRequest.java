package org.example.codenames.gameSession.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Duration;

/**
 * CreateGameRequest is a class that represents the request body for creating a new game.
 */
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class CreateGameRequest {
    /**
     * The name of the game.
     */
    public String gameName;

    /**
     * The maximum number of players that can join the game.
     */
    public Integer maxPlayers;

    /**
     * The time that a player has to decide a hint
     */
    public Duration timeForAHint;

    /**
     * The time that a player has to guess the words
     */
    public Duration timeForGuessing;

    /**
     * The language of the words
     */
    public String language;
}
