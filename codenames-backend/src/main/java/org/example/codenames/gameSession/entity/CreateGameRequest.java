package org.example.codenames.gameSession.entity;

import lombok.Data;

@Data
public class CreateGameRequest {

    public String gameName;
    public Integer maxPlayers;
    public String password;
    public String language;
}
