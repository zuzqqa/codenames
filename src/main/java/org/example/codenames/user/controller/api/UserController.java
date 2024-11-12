package org.example.codenames.user.controller.api;

import org.example.codenames.user.entity.User;
import org.example.codenames.userDetails.AuthRequest;
import org.springframework.http.ResponseEntity;

import java.util.List;

/**
 *
 * REST endpoints for user management
 * It implements basic CRUD operations for users
 * It also provides an endpoint for user authentication
 *
 */

public interface UserController {

    // Create a new user
    public ResponseEntity<String> createUser(User user);

    // Get a user by ID
    public ResponseEntity<User> getUserById(String id);

    // Get all users
    public List<User> getAllUsers();

    // Update a user by ID
    public ResponseEntity<User> updateUser(String id, User updatedUser);

    // Delete a user by ID
    public ResponseEntity<Void> deleteUserById(String id);

    // Authenticate a user and get a JWT token in response body
    public ResponseEntity<String> authenticateAndGetToken(AuthRequest authRequest);
}
