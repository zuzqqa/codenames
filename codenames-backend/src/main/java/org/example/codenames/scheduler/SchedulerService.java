package org.example.codenames.scheduler;


import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
import lombok.extern.slf4j.Slf4j;
import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.user.entity.User;
import org.example.codenames.user.repository.api.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/**
 * SchedulerService is responsible for managing scheduled tasks.
 */
@Service
@Slf4j
public class SchedulerService {

    /**
     * The activityMap is a Hazelcast distributed map that stores the activity of users.
     * The key is the user ID and the value is the last active time of the user.
     */
    private final IMap<String, LocalDateTime> activityMap;

    /**
     * The gameSessionMap is a Hazelcast distributed map that stores the game sessions.
     * The key is the game session ID and the value is the GameSession object.
     */
    private final IMap<String, GameSession> gameSessionMap;

    /**
     * The userRepository is a Spring Data JPA repository that provides CRUD operations for User entities.
     */
    private final UserRepository userRepository;

    /**
     * Constructor for SchedulerService.
     * @param hazelcastInstance the Hazelcast instance used for distributed data storage
     * @param userRepository the user repository used for CRUD operations
     */
    public SchedulerService(HazelcastInstance hazelcastInstance, UserRepository userRepository) {
        this.activityMap = hazelcastInstance.getMap("activeUsers");
        this.gameSessionMap = hazelcastInstance.getMap("gameSessions");
        this.userRepository = userRepository;
    }

    /**
     * Scheduled task to clean up the user collection from inactive guest users.
     * This task runs every 10 minutes.
     * It checks the activity map for active users and deletes any guest users that are not present in the activity map.
     */
    @Scheduled(fixedRateString = "${codenames.scheduled.users-cleanup}")
    public void cleanUserCollection() {

        log.info("Running scheduled task to clean up user collection.");
        Set<String> activityKeys = activityMap.keySet();

        List<User> allGuests = userRepository.findByRolesContaining("GUEST");
        if(allGuests == null || allGuests.isEmpty()) {
            return;
        }
        for (User user : allGuests) {
            String userId = user.getId();

            if (!activityKeys.contains(userId)) {
                log.warn("Deleting inactive guest user: {}", user.getUsername());
                userRepository.deleteById(userId);
            }
        }
    }

    /**
     * Scheduled task to clean up the game session collection.
     * This task runs every 10 minutes.
     * Firstly it deletes any inactive users from the game sessions.
     * Next it checks the game session map for active game sessions and deletes any game sessions that have no connected users.
     */
    @Scheduled(fixedRateString = "${codenames.scheduled.games-cleanup}")
    public void cleanGameSessionCollection() {
        Set<String> gameSessionKeys = gameSessionMap.keySet();
        Set<String> activityKeys = activityMap.keySet();
        List<GameSession> allGameSessions = gameSessionMap.values().stream().toList();
        if(allGameSessions.isEmpty()) {
            return;
        }

        for (GameSession gameSession : allGameSessions) {
            gameSession.getConnectedUsers().get(0).removeIf(user -> !activityKeys.contains(user.getId()));
            gameSession.getConnectedUsers().get(1).removeIf(user -> !activityKeys.contains(user.getId()));
            if(gameSession.getConnectedUsers().get(0).isEmpty() && gameSession.getConnectedUsers().get(1).isEmpty()) {
                gameSessionMap.delete(gameSession.getSessionId());
            }
        }
    }
}