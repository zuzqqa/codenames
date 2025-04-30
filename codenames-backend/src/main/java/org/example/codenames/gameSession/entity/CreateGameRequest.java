package org.example.codenames.gameSession.entity;

import lombok.Data;

/**
 * CreateGameRequest is a class that represents the request body for creating a new game.
 */
@Data
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
     * Password for private session.
     */
    public String password;

    /**
     * The language of the words.
     */
    public String language;
}
