package org.example.codenames.gameSession.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
     * Password for private session.
     */
    public String password;

    /**
     * The language of the words.
     */
    public String language;
}
