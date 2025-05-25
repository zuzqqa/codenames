package org.example.codenames.gameSession.repository.api;

import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
import org.example.codenames.gameSession.entity.GameSession;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Repository for GameSession entity.
 */
@Repository
public class GameSessionRepository {

    private final IMap<String, GameSession> gameSessionMap;

    public GameSessionRepository(HazelcastInstance hazelcastInstance) {
        this.gameSessionMap = hazelcastInstance.getMap("gameSessions");
    }

    public void save(GameSession session) {
        gameSessionMap.put(session.getSessionId().toString(), session);
    }

    public Optional<GameSession> findBySessionId(UUID sessionId) {
        return Optional.ofNullable(gameSessionMap.get(sessionId.toString()));
    }

    public void deleteById(UUID sessionId) {
        gameSessionMap.remove(sessionId.toString());
    }

    public List<GameSession> findAll() {
        return new ArrayList<>(gameSessionMap.values());
    }

    public boolean existsById(UUID sessionId) {
        return gameSessionMap.containsKey(sessionId.toString());
    }

    public Set<UUID> findAllIds() {
        return gameSessionMap.keySet().stream().map(UUID::fromString).collect(Collectors.toSet());
    }

    public void deleteAll() {
        gameSessionMap.clear();
    }
}
