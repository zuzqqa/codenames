package org.example.codenames.scheduler;


import lombok.RequiredArgsConstructor;
import org.example.codenames.user.entity.User;
import org.example.codenames.user.repository.api.UserRepository;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class scheduleService {
    private final RedisTemplate<String, Object> redisTemplate;
    private final UserRepository userRepository;

    @Scheduled(fixedRate = 60000)
    public void checkActiveUsers() {
        Set<String> activeKeys = redisTemplate.keys("activeUser:*");

        if (activeKeys == null || activeKeys.isEmpty()) {
            System.out.println("No active users detected.");
            return;
        }

        Set<String> activeUserIds = activeKeys.stream()
                .map(key -> key.replace("activeUser:", ""))
                .collect(Collectors.toSet());

        for(String userId : activeUserIds) {
            String lastActiveTime = (String) redisTemplate.opsForValue().get("activeUser:" + userId);
            if (lastActiveTime != null) {
                System.out.println("User ID: " + userId + ", Last Active Time: " + lastActiveTime);
            }
        }
        List<User> allUsers = userRepository.findAll();
        for(User user : allUsers) {
            String userId = user.getId().toString();
            if (!activeUserIds.contains(userId) && user.getRoles().contains("ROLE_GUEST")) {
                userRepository.deleteById(userId);
            }
        }
    }

    @Scheduled(fixedRate = 60000)
    public void cleanUpOldSessions() {
        Set<String> keys = redisTemplate.keys("gameSession:*");

        if (keys == null || keys.isEmpty()) return;

        for (String key : keys) {
            Map<Object, Object> session = redisTemplate.opsForHash().entries(key);

            String status = (String) session.get("status");
            String lastActivityStr = (String) session.get("lastUpdated");

            boolean shouldDelete = "FINISHED".equals(status);

            if (shouldDelete) {
                redisTemplate.delete(key);
                System.out.println("Deleted session: " + key);
            }
        }
    }

    private boolean isTooOld(String lastUpdated) {
        if (lastUpdated == null) return true;
        try {
            Instant updated = Instant.parse(lastUpdated);
            return updated.isBefore(Instant.now().minus(Duration.ofMinutes(10)));
        } catch (Exception e) {
            return true;
        }
    }
}
