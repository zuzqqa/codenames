package org.example.codenames.gameSession.repository;

import org.example.codenames.gameSession.entity.GameSession;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for GameSession entity
 */
@Repository
public interface GameSessionRepository extends MongoRepository<GameSession, String> {
    @NonNull
    Optional<GameSession> findBySessionId(UUID sessionId);

    @NonNull
    List<GameSession> findAll();
}
