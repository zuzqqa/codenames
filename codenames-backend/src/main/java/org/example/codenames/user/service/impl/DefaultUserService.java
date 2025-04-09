package org.example.codenames.user.service.impl;

import com.github.javafaker.Faker;

import org.example.codenames.user.entity.User;
import org.example.codenames.user.repository.api.UserRepository;
import org.example.codenames.user.service.api.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
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
     * Constructs a new DefaultUserService with the given user repository and password encoder.
     *
     * @param userRepository the user repository
     * @param passwordEncoder the password encoder
     */
    @Autowired
    public DefaultUserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Creates a new user.
     *
     * @param user the user to be created
     * @return the created user
     */
    @Override
    public Optional<String> createUser(User user) {
        user.setStatus(User.userStatus.INACTIVE);

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
    @Override
    public Optional<User> updateUser(String id, User updatedUser) {
        return Optional.ofNullable(userRepository.findById(id)
                                   .map(user -> {
                    user.setUsername(updatedUser.getUsername());
                    user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
                    return userRepository.save(user);
                }).orElseThrow(() -> new IllegalArgumentException("User not found")));
    }

    public void updateServiceId(String email, String serviceId) {
        userRepository.findByUsername(email)
                .ifPresent(user -> {
                    user.setResetId(serviceId);
                    userRepository.save(user);
                });
    }

    @Override
    public void resetPassword(String uuid, String password) {
        userRepository.findByResetId(uuid)
                .ifPresent(user -> {
                    System.out.println(user.getUsername());
                    System.out.println("New password: " + password);
                    String encodedPassword = passwordEncoder.encode(password);
                    System.out.println("New encoded password: " + encodedPassword);
                    user.setPassword(encodedPassword);
                    System.out.println("User password: " + user.getPassword());
                    user.setResetId(null);
                    userRepository.save(user);
                });
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
     * @return a unique username combining an adjective and a noun, without whitespaces.
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
