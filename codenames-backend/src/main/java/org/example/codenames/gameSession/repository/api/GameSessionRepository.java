package org.example.codenames.gameSession.repository.api;

import org.example.codenames.gameSession.entity.GameSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GameSessionRepository extends MongoRepository<GameSession, String> {
    Optional<GameSession> findByGameName(String gameName);
    Optional<GameSession> findBySessionId(UUID sessionId);
}
