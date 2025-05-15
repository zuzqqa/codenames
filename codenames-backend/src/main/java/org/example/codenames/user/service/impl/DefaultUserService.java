package org.example.codenames.user.service.impl;

import com.github.javafaker.Faker;

import jakarta.servlet.http.HttpServletRequest;

import org.example.codenames.tokens.passwordResetToken.entity.PasswordResetToken;
import org.example.codenames.tokens.passwordResetToken.repository.api.PasswordResetTokenRepository;
import org.example.codenames.tokens.passwordResetToken.service.api.PasswordResetServiceToken;
import org.example.codenames.user.entity.User;
import org.example.codenames.user.repository.api.UserRepository;
import org.example.codenames.user.service.api.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

/**
 * Default implementation of the {@link UserService} interface.
 */
@Service
public class DefaultUserService implements UserService {
    /**
     * The user repository.
     */
    private final UserRepository userRepository;

    /**
     * Encoder used to securely hash and verify game session passwords,
     * preventing storage of plain-text passwords.
     */
    private final PasswordEncoder passwordEncoder;

    /**
     * Repository for managing password reset tokens in the database.
     */
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    /**
     * Service responsible for handling password reset process.
     */
    private final PasswordResetServiceToken passwordResetServiceToken;

    /**
     * Constructs a new DefaultUserService with the given user repository, password encoder, passwordResetTokenRepository and passwordResetService.
     *
     * @param userRepository the user repository
     * @param passwordEncoder the password encoder
     * @param passwordResetTokenRepository the password reset tokens repository
     * @param passwordResetServiceToken the password reset service
     */
    @Autowired
    public DefaultUserService(UserRepository userRepository, PasswordEncoder passwordEncoder, PasswordResetTokenRepository passwordResetTokenRepository, PasswordResetServiceToken passwordResetServiceToken) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordResetServiceToken = passwordResetServiceToken;
    }

    /**
     * Creates a new user.
     *
     * @param user the user to be created
     * @return the created user
     */
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
            if(user.getRoles() == null) {
                user.setRoles("ROLE_USER");
            }
            user.setProfilePic(0);
            user.setDescription("");
        }

        userRepository.save(user);

        return Optional.empty();
    }

    /**
     * Retrieves a user by their ID.
     *
     * @param id the ID of the user
     * @return the user, if found
     */
    @Override
    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    /**
     * Retrieves a user by their username.
     *
     * @param username the username of the user
     * @return the user, if found
     */
    @Override
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Retrieves all users.
     *
     * @return a list of all users
     */
    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Updates a user by their ID.
     *
     * @param id the ID of the user
     * @param updatedUser the updated user
     * @return the updated user, if found
     * @throws IllegalArgumentException if the user was not found in the repository
     */
    /**
     * Updates a user by their ID.
     * @param id the ID of the user
     * @param updatedUser the updated user
     * @return the updated user, if found
     */
    public Optional<User> updateUser(String id, User updatedUser) {
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
                    return userRepository.save(user);
                })
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id)));
    }

    /**
     * Searches for users with an active status and usernames containing the specified substring.
     *
     * @param username the substring to search in usernames
     * @return list of users with matching usernames and ACTIVE status
     */
    @Override
    public List<User> searchActiveUsersByUsername(String username) {
        return userRepository.findByUsernameContainingAndStatus(username, "ACTIVE");
    }

    /**
     * Sends a friend request from one user to another.
     *
     * @param senderUsername the username of the sender
     * @param receiverUsername the username of the receiver
     */
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

    /**
     * Accepts a friend request.
     *
     * @param receiverUsername the username of the user accepting the request
     * @param senderUsername the username of the user who sent the request
     */
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

    /**
     * Declines a friend request.
     *
     * @param receiverUsername the username of the user declining the request
     * @param senderUsername the username of the user who sent the request
     */
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

    /**
     * Removes a friend relationship between two users.
     *
     * @param user1Username the username of the first user
     * @param user2Username the username of the second user
     */
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

    /**
     * Resets the user's password based on the provided token.
     *
     * @param token the reset token provided by the user
     * @param request the HTTP request containing additional context (such as IP address) for the password reset operation
     * @param password the new password provided by the user
     * @return {@code true} if password reset was successful, {@code false} otherwise
     */
    @Override
    public boolean resetPassword(String token, HttpServletRequest request, String password) {
        Optional<PasswordResetToken> optionalPasswordResetToken = passwordResetTokenRepository.findByToken(token);

        if (optionalPasswordResetToken.isPresent()) {
            PasswordResetToken passwordResetToken = optionalPasswordResetToken.get();

            if (passwordResetServiceToken.isValidToken(token, request)) {
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

    /**
     * Deletes a user by their ID.
     *
     * @param id the ID of the user
     */
    @Override
    public void deleteUserById(String id) {
        userRepository.deleteById(id);
    }

    /**
     * Performs user account activation.
     *
     * @param username the username
     */
    @Override
    public void activateUser(String username) {
        userRepository.findByUsername(username).map(user -> {
                    user.setStatus(User.userStatus.ACTIVE);

                    return userRepository.save(user);
                })
                .orElse(null);
    }

    /**
     * Checks whether the account with the given username is activated.
     *
     * @param username the username of the account to check
     * @return {@code true} if the account is activated; {@code false} otherwise
     * @throws UsernameNotFoundException if no user is found with the given username
     */
    @Override
    public boolean isAccountActivated(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return user.getStatus() == User.userStatus.ACTIVE;
    }

    /**
     * Generates a unique username consisting of an adjective and a noun.
     *
     * @return a unique username combining an adjective and a noun, without whitespaces
     */
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
}
