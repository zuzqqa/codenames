package org.example.codenames.user.service.impl;

import org.example.codenames.user.entity.User;
import org.example.codenames.user.repository.api.UserRepository;
import org.example.codenames.user.service.api.UserService;

import org.springframework.beans.factory.annotation.Autowired;
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
     * The password encoder.
     */
    private final PasswordEncoder passwordEncoder;

    /**
     * Constructs a new DefaultUserService with the given user repository and password encoder.
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
     * @param user the user to be created
     */
    @Override
    public void createUser(User user) {
        if (!user.isGuest()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        userRepository.save(user);
    }

    /**
     * Retrieves a user by their ID.
     * @param id the ID of the user
     * @return the user, if found
     */
    @Override
    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    /**
     * Retrieves a user by their username.
     * @param username the username of the user
     * @return the user, if found
     */
    @Override
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Retrieves all users.
     * @return a list of all users
     */
    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Updates a user by their ID.
     * @param id the ID of the user
     * @param updatedUser the updated user
     * @return the updated user, if found
     */
    @Override
    public User updateUser(String id, User updatedUser) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setUsername(updatedUser.getUsername());
                    user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
                    return userRepository.save(user);
                })
                .orElse(null);
    }

    /**
     * Deletes a user by their ID.
     * @param id the ID of the user
     */
    @Override
    public void deleteUserById(String id) {
        userRepository.deleteById(id);
    }
}
