package org.example.codenames.scheduler;


import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
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
public class SchedulerService {

    /**
     * The activityMap is a Hazelcast distributed map that stores the activity of users.
     * The key is the user ID and the value is the last active time of the user.
     */
    private final IMap<String, LocalDateTime> activityMap;

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
        this.userRepository = userRepository;
    }

    /**
     * Scheduled task to clean up the user collection from inactive guest users.
     * This task runs every 10 minutes.
     * It checks the activity map for active users and deletes any guest users that are not present in the activity map.
     */
    @Scheduled(fixedRate = 600000)
    public void cleanUserCollection() {

        Set<String> activityKeys = activityMap.keySet();

        List<User> allGuests = userRepository.findByRolesContaining("GUEST");
        if(allGuests == null || allGuests.isEmpty()) {
            return;
        }
        for (User user : allGuests) {
            String userId = user.getId();

            if (!activityKeys.contains(userId)) {
                userRepository.deleteById(userId);
            }
        }
    }

}