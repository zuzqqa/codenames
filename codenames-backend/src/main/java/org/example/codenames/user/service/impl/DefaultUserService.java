package org.example.codenames.user.service.impl;

import com.github.javafaker.Faker;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.example.codenames.tokens.passwordResetToken.entity.PasswordResetToken;
import org.example.codenames.tokens.passwordResetToken.repository.api.PasswordResetTokenRepository;
import org.example.codenames.tokens.passwordResetToken.service.api.PasswordResetTokenService;
import org.example.codenames.user.entity.User;
import org.example.codenames.user.entity.dto.GetFriendDataResponse;
import org.example.codenames.user.entity.dto.GetUserResponse;
import org.example.codenames.user.entity.mapper.UserMapper;
import org.example.codenames.user.repository.api.UserRepository;
import org.example.codenames.user.service.api.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

/**
 * Default implementation of the {@link UserService} interface.
 */
@Service
@Slf4j
public class DefaultUserService implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordResetTokenService passwordResetTokenService;
    private final IMap<String, LocalDateTime> activityMap;

    @Autowired
    public DefaultUserService(UserRepository userRepository, PasswordEncoder passwordEncoder, PasswordResetTokenRepository passwordResetTokenRepository, PasswordResetTokenService passwordResetTokenService, HazelcastInstance hazelcastInstance) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordResetTokenService = passwordResetTokenService;
        this.activityMap = hazelcastInstance.getMap("activeUsers");
    }

    @Override
    public Optional<String> createUser(User user) {
        if (Objects.equals(user.getRoles(), "ROLE_USER")) {
            user.setStatus(User.userStatus.INACTIVE);
        } else {
            user.setStatus(User.userStatus.ACTIVE);
        }

        if (!user.isGuest() && (user.getEmail() == null || user.getEmail().isEmpty())) {
            return Optional.of("Invalid email address");
        }

        if (!user.isGuest() && userRepository.existsByEmail(user.getEmail())) {
            return Optional.of("E-mail already exists.");
        }

        if (!user.isGuest() && userRepository.existsByUsername(user.getUsername())) {
            return Optional.of("Username already exists.");
        }

        if (!user.isGuest()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            if (user.getRoles() == null) {
                user.setRoles("ROLE_USER");
            }
            user.setProfilePic(0);
            user.setDescription("");
        }

        userRepository.save(user);

        return Optional.empty();
    }

    @Override
    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    @Override
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<GetUserResponse> updateUser(String id, User updatedUser) {
        return Optional.ofNullable(userRepository.findById(id)
                .map(user -> {
                    user.setUsername(updatedUser.getUsername());
                    user.setEmail(updatedUser.getEmail());
                    user.setGuest(false);
                    user.setDescription(updatedUser.getDescription());
                    user.setProfilePic(updatedUser.getProfilePic());

                    if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
                        user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
                    }
                    return UserMapper.toGetUserResponse(userRepository.save(user));
                })
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id)));
    }

    @Override
    public List<User> searchActiveUsersByUsername(String username) {
        return userRepository.findByUsernameContainingAndStatusAndIsGuest(username, User.userStatus.valueOf(String.valueOf(User.userStatus.ACTIVE)), false);
    }

    @Override
    public GetFriendDataResponse getFriendData(String username) {
        Optional<User> user = userRepository.findByUsername(username);
        if (user.isPresent()) {
            User u = user.get();
            return GetFriendDataResponse.builder()
                    .friends(u.getFriends())
                    .receivedRequests(u.getReceivedRequests())
                    .sentRequests(u.getSentRequests())
                    .build();
        } else {
            log.warn("User not found when trying to get friend data for username: {}", username);
            return null;
        }
    }

    @Override
    public void sendFriendRequest(String senderUsername, String receiverUsername) {
        if (senderUsername.equals(receiverUsername)) {
            throw new RuntimeException("You cannot send a friend request to yourself");
        }

        User sender = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findByUsername(receiverUsername)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        if (!sender.getSentRequests().contains(receiverUsername) && !sender.getFriends().contains(receiverUsername)) {
            sender.getSentRequests().add(receiverUsername);
            receiver.getReceivedRequests().add(senderUsername);

            userRepository.save(sender);
            userRepository.save(receiver);
        }
    }

    @Override
    public void acceptFriendRequest(String receiverUsername, String senderUsername) {
        User sender = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findByUsername(receiverUsername)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        if (receiver.getReceivedRequests().contains(senderUsername)) {
            receiver.getReceivedRequests().remove(senderUsername);
            sender.getSentRequests().remove(receiverUsername);

            receiver.getFriends().add(senderUsername);
            sender.getFriends().add(receiverUsername);

            userRepository.save(receiver);
            userRepository.save(sender);
        }
    }

    @Override
    public void declineFriendRequest(String receiverUsername, String senderUsername) {
        User sender = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findByUsername(receiverUsername)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        receiver.getReceivedRequests().remove(senderUsername);
        sender.getSentRequests().remove(receiverUsername);

        userRepository.save(receiver);
        userRepository.save(sender);
    }

    @Override
    public void removeFriend(String user1Username, String user2Username) {
        User user1 = userRepository.findByUsername(user1Username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User user2 = userRepository.findByUsername(user2Username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user1.getFriends().remove(user2Username);
        user2.getFriends().remove(user1Username);

        userRepository.save(user1);
        userRepository.save(user2);
    }

    @Override
    public boolean resetPassword(String token, HttpServletRequest request, String password) {
        Optional<PasswordResetToken> optionalPasswordResetToken = passwordResetTokenRepository.findByToken(token);

        if (optionalPasswordResetToken.isPresent()) {
            PasswordResetToken passwordResetToken = optionalPasswordResetToken.get();

            if (passwordResetTokenService.isValidToken(token)) {
                userRepository.findByEmail(passwordResetToken.getUserEmail())
                        .ifPresent(user -> {
                            String encodedPassword = passwordEncoder.encode(password);
                            user.setPassword(encodedPassword);
                            userRepository.save(user);
                        });
                return true;
            }
        }

        return false;
    }

    @Override
    public void deleteUserById(String id) {
        userRepository.deleteById(id);
    }

    @Override
    public void activateUser(String username) {
        userRepository.findByUsername(username).map(user -> {
                    user.setStatus(User.userStatus.ACTIVE);

                    return userRepository.save(user);
                })
                .orElse(null);
    }

    @Override
    public boolean isAccountActivated(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return user.getStatus() == User.userStatus.ACTIVE;
    }

    @Override
    public String generateUniqueUsername() {
        Faker faker = new Faker();

        String[] adjectives = {"Fast", "Mighty", "Clever", "Brave", "Lucky", "Fierce", "Gentle"};
        String username;

        do {
            String adjective = adjectives[faker.random().nextInt(adjectives.length)];
            String noun = faker.animal().name();
            username = (adjective + noun).replace(" ", "");

        } while (userRepository.existsByUsername(username));

        return username;
    }

    @Override
    public void updateUserActiveStatus(String userId) {
        activityMap.put(userId, LocalDateTime.now());
    }

    @Override
    public Map<String, LocalDateTime> getAllActiveUsers() {
        return activityMap.getAll(activityMap.keySet());
    }
}