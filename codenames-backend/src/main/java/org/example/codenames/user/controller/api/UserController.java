package org.example.codenames.user.controller.api;

import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletResponse;
import org.example.codenames.user.entity.User;
import org.example.codenames.userDetails.AuthRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;

import java.io.IOException;
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
  
    ResponseEntity<Map<String, String>> createUser(@RequestBody User user, HttpServletResponse response, String language) throws MessagingException, IOException;

    ResponseEntity<User> getUserById(String id);

    List<User> getAllUsers();

    ResponseEntity<Map<String, String>> getUserByToken(String token);

    ResponseEntity<User> updateUser(String id, User updatedUser);

    ResponseEntity<Void> deleteUserById(String id);

    ResponseEntity<String> authenticateAndSetCookie(AuthRequest authRequest, HttpServletResponse response);

    ResponseEntity<Void> logout(HttpServletResponse response);

    ResponseEntity<String> getUsernameByToken(String token);

    ResponseEntity<String> getIdByToken(String token);
}
