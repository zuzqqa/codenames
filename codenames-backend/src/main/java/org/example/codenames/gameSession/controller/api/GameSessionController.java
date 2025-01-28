package org.example.codenames.gameSession.controller.api;

import org.example.codenames.gameSession.entity.CreateGameRequest;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.entity.HintRequest;
import org.example.codenames.gameSession.entity.VoteRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface GameSessionController {
    ResponseEntity<GameSession> getGameSession(@PathVariable String gameId);

    ResponseEntity<?> submitVote(@PathVariable UUID id, @RequestBody VoteRequest voteRequest);

    ResponseEntity<String> getVotes(@PathVariable UUID id);

    ResponseEntity<?> getUsersByTeam(@PathVariable String gameId, @RequestParam String teamIndex);
}
