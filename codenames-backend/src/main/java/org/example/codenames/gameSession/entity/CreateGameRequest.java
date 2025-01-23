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
    public Duration durationOfTheRound;
    public Duration timeForGuessing;
    public Duration timeForAHint;
    public Integer numberOfRounds;
}
