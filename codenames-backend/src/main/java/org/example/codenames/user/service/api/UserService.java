package org.example.codenames.user.service.api;

import jakarta.servlet.http.HttpServletRequest;
import org.example.codenames.user.entity.User;

import java.util.List;
import java.util.Optional;

/**
 * Service for managing users.
 */
public interface UserService {
    Optional<String> createUser(User user);

    Optional<User> getUserById(String id);

    Optional<User> getUserByUsername(String username);

    List<User> getAllUsers();

    Optional<User> updateUser(String id, User updatedUser);

    void activateUser(String username);

    boolean isAccountActivated(String username);

    String generateUniqueUsername();

    boolean resetPassword(String uuid, HttpServletRequest request, String password);

    void deleteUserById(String id);
}
