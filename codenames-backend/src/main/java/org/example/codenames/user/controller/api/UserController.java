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
    ResponseEntity<Void> createUser(User user, HttpServletResponse response);

    ResponseEntity<User> getUserById(String id);

    List<User> getAllUsers();

    ResponseEntity<Map<String, String>> getUserByToken(String token);

    ResponseEntity<User> updateUser(String id, User updatedUser);

    ResponseEntity<Void> deleteUserById(String id);

    ResponseEntity<Void> authenticateAndSetCookie(AuthRequest authRequest, HttpServletResponse response);

    ResponseEntity<Void> logout(HttpServletResponse response);

    ResponseEntity<String> getUsernameByToken(String token);

    ResponseEntity<String> getIdByToken(String token);
}
