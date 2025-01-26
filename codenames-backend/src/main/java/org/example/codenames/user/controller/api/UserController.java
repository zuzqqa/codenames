package org.example.codenames.user.controller.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.codenames.user.entity.User;
import org.example.codenames.userDetails.AuthRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.CookieValue;

import java.util.List;
import java.util.Map;

/**
 *
 * REST endpoints for user management
 * It implements basic CRUD operations for users
 * It also provides an endpoint for user authentication
 *
 */

public interface UserController {

    // Create a new user
    public ResponseEntity<Void> createUser(User user, HttpServletResponse response);

    // Get a user by ID
    public ResponseEntity<User> getUserById(String id);

    // Get all users
    public List<User> getAllUsers();

    // Get a user by token
    public ResponseEntity<Map<String, String>> getUserByToken(String token);

    // Update a user by ID
    public ResponseEntity<User> updateUser(String id, User updatedUser);

    // Delete a user by ID
    public ResponseEntity<Void> deleteUserById(String id);

    // Authenticate a user and get a JWT token in response body
    public ResponseEntity<Void> authenticateAndSetCookie(AuthRequest authRequest, HttpServletResponse response);

    //Logout
    public ResponseEntity<Void> logout(HttpServletResponse response);

    //Get Username by token
    public ResponseEntity<String> getUsernameByToken(String token);

    //Get id by token
    public ResponseEntity<String> getIdByToken(String token);
}
