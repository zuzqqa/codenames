package org.example.codenames.gameSession.entity;

import lombok.*;

import java.time.Duration;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class CreateGameRequest {
    public String gameName;
    public Integer maxPlayers;
    public Duration timeForAHint;
    public Duration timeForGuessing;
    public String language;
}
