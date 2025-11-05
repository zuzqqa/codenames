package org.example.codenames.user.controller.api;

import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.codenames.user.entity.PasswordResetRequest;
import org.example.codenames.user.entity.User;
import org.example.codenames.user.entity.dto.FriendRequestsDTO;
import org.example.codenames.userDetails.auth.AuthRequest;
import org.example.codenames.userDetails.auth.AuthResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.view.RedirectView;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * REST endpoints for user management
 * It implements basic CRUD operations for users
 * It also provides an endpoint for user authentication
 */
public interface UserController {
    ResponseEntity<Map<String, String>> createUser(@RequestBody User user, String language) throws MessagingException, IOException;

    RedirectView activateAccount(@PathVariable String token);

    ResponseEntity<User> getUserById(String id);

    List<User> getAllUsers();

    ResponseEntity<Map<String, String>> getUserByToken(String token);

    ResponseEntity<User> updateUser(String id, User updatedUser);

    ResponseEntity<Void> deleteUserById(String id);

    ResponseEntity<AuthResponse> authenticateAndGenerateJWT(AuthRequest authRequest);

    ResponseEntity<String> getUsernameByToken(@RequestHeader(value = "Authorization", required = false) String token);

    ResponseEntity<String> getIdByToken(@RequestHeader(value = "Authorization", required = false) String token);

    ResponseEntity<Boolean> isGuest(@RequestHeader(value = "Authorization", required = false) String token);

    ResponseEntity<String> createGuest(HttpServletResponse response);

    ResponseEntity<List<User>> searchUsers(@RequestParam String username);

    ResponseEntity<Void> sendFriendRequest(@PathVariable String receiverUsername, @RequestParam String senderUsername);

    ResponseEntity<Void> declineFriendRequest(@PathVariable String senderUsername, @RequestParam String receiverUsername);

    ResponseEntity<Void> acceptFriendRequest(@PathVariable String senderUsername, @RequestParam String receiverUsername);

    ResponseEntity<Void> removeFriend(@PathVariable String friendUsername, @RequestParam String userUsername);

    ResponseEntity<FriendRequestsDTO> getFriendRequests(@PathVariable String username);

    ResponseEntity<String> updatePassword(@PathVariable String token, HttpServletRequest request, @RequestBody PasswordResetRequest passwordResetRequest);

    ResponseEntity<Void> updateUserActiveStatus(@RequestBody String userId);

    ResponseEntity<Map<String, LocalDateTime>> getAllUserActivity();
}
