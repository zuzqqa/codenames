package org.example.codenames.gameSession.repository.api;

import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
import org.example.codenames.gameSession.entity.GameSession;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Repository for GameSession entity.
 * Uses Hazelcast IMap for storage and retrieval of GameSession objects.
 */
@Repository
public class GameSessionRepository {

    private final IMap<String, GameSession> gameSessionMap;

    public GameSessionRepository(HazelcastInstance hazelcastInstance) {
        this.gameSessionMap = hazelcastInstance.getMap("gameSessions");
    }

    /**
     * Saves a GameSession to the Hazelcast IMap.
     *
     * @param session the GameSession to save
     */
    public void save(GameSession session) {
        gameSessionMap.put(session.getSessionId().toString(), session);
    }

    /**
     * Finds a GameSession by its sessionId.
     *
     * @param sessionId the UUID of the GameSession
     * @return an Optional containing the GameSession if found, or empty if not found
     */
    public Optional<GameSession> findBySessionId(UUID sessionId) {
        return Optional.ofNullable(gameSessionMap.get(sessionId.toString()));
    }

    /**
     * Deletes a GameSession by its sessionId.
     *
     * @param sessionId the UUID of the GameSession to delete
     */
    public void deleteById(UUID sessionId) {
        gameSessionMap.remove(sessionId.toString());
    }

    /**
     * Retrieves all GameSessions.
     *
     * @return a List of all GameSessions
     */
    public List<GameSession> findAll() {
        return new ArrayList<>(gameSessionMap.values());
    }

    /**
     * Checks if a GameSession exists by its sessionId.
     *
     * @param sessionId the UUID of the GameSession
     * @return true if the GameSession exists, false otherwise
     */
    public boolean existsById(UUID sessionId) {
        return gameSessionMap.containsKey(sessionId.toString());
    }

    /**
     * Retrieves all GameSession IDs.
     *
     * @return a Set of UUIDs representing all GameSession IDs
     */
    public Set<UUID> findAllIds() {
        return gameSessionMap.keySet().stream().map(UUID::fromString).collect(Collectors.toSet());
    }

    /**
     * Deletes all GameSessions.
     */
    public void deleteAll() {
        gameSessionMap.clear();
    }
}
