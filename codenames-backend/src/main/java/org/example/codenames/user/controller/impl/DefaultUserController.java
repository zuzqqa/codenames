package org.example.codenames.user.controller.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;

import org.example.codenames.email.service.api.EmailService;
import org.example.codenames.jwt.JwtService;
import org.example.codenames.tokens.passwordResetToken.service.api.PasswordResetServiceToken;
import org.example.codenames.user.entity.dto.FriendRequestsDTO;
import org.example.codenames.user.entity.PasswordResetRequest;
import org.example.codenames.user.entity.User;
import org.example.codenames.user.controller.api.UserController;
import org.example.codenames.user.service.api.UserService;
import org.example.codenames.userDetails.auth.AuthRequest;

import org.example.codenames.userDetails.auth.AuthResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.io.IOException;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Default implementation of the {@link UserController} interface.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class DefaultUserController implements UserController {
    private final EmailService emailService;
    private final PasswordResetServiceToken passwordResetServiceToken;
    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${backend.url:http://localhost:8080}")
    private String backendUrl;
    /**
     * Service for managing actions on user's account.
     */
    private final UserService userService;

    /**
     * Authentication manager used for handling user authentication and verifying credentials.
     */
    private final AuthenticationManager authenticationManager;

    /**
     * Service responsible for handling JWT operations such as token generation, validation, and extraction of claims.
     */
    private final JwtService jwtService;

    /**
     * Service for sending emails through JavaMail.
     */
    private final JavaMailSender mailSender;

    /**
     * Creates a new user and generates an authentication token.
     *
     * @param user the user to be created
     * @return ResponseEntity with status 200 OK
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> createUser(@RequestBody User user, @RequestParam String language) throws MessagingException, IOException {
        Optional<String> errorMessage = userService.createUser(user);

        if (errorMessage.isPresent()) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", errorMessage.get());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }

        if (!user.isGuest() && !Objects.equals(user.getRoles(), "ROLE_ADMIN")) {
            emailService.sendAccountActivationEmail(user.getUsername(), user.getEmail(), language);
        }

        return ResponseEntity.ok().build();
    }

    /**
     * Activates a user account based on the provided authentication token.
     *
     * @param token the authentication token that is used to retrieve the username and activate the corresponding user account
     * @return a {@link RedirectView} that redirects the user to the appropriate page
     */
    @GetMapping("/activate/{token}")
    public RedirectView activateAccount(@PathVariable String token) {
        try {
            String username = jwtService.getUsernameFromToken(token);
            userService.activateUser(username);

            return new RedirectView(frontendUrl + "/login?activated=true&username=" + username);
        } catch (Exception e) {
            return new RedirectView(frontendUrl + "/register?activated=false");
        }
    }

    /**
     * Retrieves a user by their ID.
     *
     * @param id the ID of the user
     * @return ResponseEntity containing the user or 404 if not found
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Retrieves all users. Only accessible to admins.
     *
     * @return a list of all users
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    /**
     * Retrieves a username based on the provided authentication token.
     *
     * @param token the JWT token
     * @return ResponseEntity containing the username
     */
    @GetMapping("/username/{token}")
    public ResponseEntity<Map<String, String>> getUserByToken(@PathVariable String token) {
        String username = jwtService.ExtractUsername(token);
        Map<String, String> response = new HashMap<>();
        response.put("username", username);
        return ResponseEntity.ok(response);
    }

    /**
     * Updates a user by their ID.
     *
     * @param id the ID of the user
     * @param updatedUser the updated user information
     * @return ResponseEntity containing the updated user or 404 if not found
     */
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody User updatedUser) {
        Optional<User> user = userService.updateUser(id, updatedUser);
        return user.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Deletes a user by their ID. Only accessible to admins.
     *
     * @param id the ID of the user to be deleted
     * @return ResponseEntity with status 204 No Content
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUserById(@PathVariable String id) {
        userService.deleteUserById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Authenticates a user and sets an authentication cookie.
     *
     * @param authRequest the authentication request containing username and password
     */
    @PostMapping("/authenticate")
    public ResponseEntity<AuthResponse> authenticateAndGenerateJWT(@RequestBody AuthRequest authRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
            );

            if (!userService.isAccountActivated(authRequest.getUsername())) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(new AuthResponse("Account is not active."));
            }

            String token = jwtService.generateToken(authRequest.getUsername());
            return ResponseEntity.ok(new AuthResponse(token));

        } catch (BadCredentialsException ex) {
            System.out.println(authRequest.getPassword());
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse("Invalid username or password."));
        }
    }

    /**
     * Retrieves the username from the authentication token stored in a header.
     *
     * @param token the authentication token from the header
     * @return ResponseEntity containing the username
     */
    @GetMapping("/get-username")
    public ResponseEntity<String> getUsernameByToken(@RequestHeader(value = "Authorization", required = false) String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.ok("null");
        }

        token = token.substring(7);

        return ResponseEntity.ok(jwtService.getUsernameFromToken(token));
    }

    /**
     * Retrieves the user ID from the authentication token stored in a header.
     *
     * @param token the authentication token from the header
     * @return ResponseEntity containing the user ID or 404 if not found
     */
    @GetMapping("/get-id")
    public ResponseEntity<String> getIdByToken(@RequestHeader(value = "Authorization", required = false) String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.ok(null);
        }

        token = token.substring(7);
        String username = jwtService.getUsernameFromToken(token);
        Optional<User> user = userService.getUserByUsername(username);

        return user.map(User::getId).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Checks if the currently authenticated user is a guest.
     *
     * @param token the authentication token from the header
     * @return ResponseEntity containing true if the user is a guest or not authenticated, false otherwise
     */
    @GetMapping("/is-guest")
    public ResponseEntity<Boolean> isGuest(@RequestHeader(value = "Authorization", required = false) String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.ok(false);
        }
        token = token.substring(7);
        String username = jwtService.getUsernameFromToken(token);
        Optional<User> user = userService.getUserByUsername(username);

        return ResponseEntity.ok(user.map(User::isGuest).orElse(true));
    }

    /**
     * Creates a guest user and assigns a temporary authentication token.
     *
     * @param response the HTTP response to add the authentication cookie
     * @return ResponseEntity with status 200 OK
     */
    @PostMapping("/create-guest")
    public ResponseEntity<String> createGuest(HttpServletResponse response) {
        String username = userService.generateUniqueUsername();

        User guest = User.builder()
                .id(UUID.randomUUID().toString())
                .username(username)
                .password("")
                .roles("ROLE_GUEST")
                .isGuest(true)
                .build();

        userService.createUser(guest);

        String token = jwtService.generateToken(guest.getUsername());
        String jsonResponse = String.format("{\"message\": \"success\", \"token\": \"%s\"}", token);
        
        return ResponseEntity.ok(jsonResponse);
    }

    /**
     * Searches for users with usernames that match the provided string.
     *
     * @param username the username to search for
     * @return ResponseEntity containing the list of matched users
     */
    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String username) {
        List<User> users = userService.searchActiveUsersByUsername(username);
        return ResponseEntity.ok(users);
    }

    /**
     * Sends a friend request from one user to another.
     *
     * @param receiverUsername the username of the user receiving the request
     * @param senderUsername the username of the user sending the request
     * @return ResponseEntity with status 200 OK
     */
    @PostMapping("/send-request/{receiverUsername}")
    public ResponseEntity<Void> sendFriendRequest(@PathVariable String receiverUsername, @RequestParam String senderUsername) {
        userService.sendFriendRequest(senderUsername, receiverUsername);
        return ResponseEntity.ok().build();
    }

    /**
     * Declines a friend request sent by another user.
     *
     * @param senderUsername the username of the user who sent the request
     * @param receiverUsername the username of the user declining the request
     * @return ResponseEntity with status 200 OK
     */
    @PostMapping("/decline-request/{senderUsername}")
    public ResponseEntity<Void> declineFriendRequest(@PathVariable String senderUsername, @RequestParam String receiverUsername) {
        userService.declineFriendRequest(receiverUsername, senderUsername);
        return ResponseEntity.ok().build();
    }

    /**
     * Accepts a friend request sent by another user.
     *
     * @param senderUsername the username of the user who sent the request
     * @param receiverUsername the username of the user accepting the request
     * @return ResponseEntity with status 200 OK
     */
    @PostMapping("/accept-request/{senderUsername}")
    public ResponseEntity<Void> acceptFriendRequest(@PathVariable String senderUsername, @RequestParam String receiverUsername) {
        userService.acceptFriendRequest(receiverUsername, senderUsername);
        return ResponseEntity.ok().build();
    }

    /**
     * Removes a friend from the user's friend list.
     *
     * @param friendUsername the username of the friend to remove
     * @param userUsername the username of the user initiating the removal
     * @return ResponseEntity with status 200 OK
     */
    @DeleteMapping("/remove-friend/{friendUsername}")
    public ResponseEntity<Void> removeFriend(@PathVariable String friendUsername, @RequestParam String userUsername) {
        userService.removeFriend(userUsername, friendUsername);
        return ResponseEntity.ok().build();
    }

    /**
     * Retrieves all friend-related lists (friends, sent requests, received requests) for a given user.
     *
     * @param username the username of the user
     * @return ResponseEntity containing a {@link FriendRequestsDTO} or 404 if user not found
     */
    @GetMapping("/{username}/friend-requests")
    public ResponseEntity<FriendRequestsDTO> getFriendRequests(@PathVariable String username) {
        Optional<User> user = userService.getUserByUsername(username);
        if (user.isPresent()) {
            User u = user.get();

            FriendRequestsDTO dto = FriendRequestsDTO.builder()
                                                     .friends(u.getFriends())
                                                     .sentRequests(u.getSentRequests())
                                                     .receivedRequests(u.getReceivedRequests())
                                                     .build();

            return ResponseEntity.ok(dto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Resets user password based on the token and new password provided.
     *
     * @param token the reset token provided by the user.
     * @param request the HTTP request containing additional context (such as IP address) for the password reset operation.
     * @param passwordResetRequest the entity containing new password.
     * @return ResponseEntity with status 200 OK if password change was successful or 400 BAD REQUEST otherwise
     */
    @PostMapping("/reset-password/{token}")
    public ResponseEntity<String> updatePassword(@PathVariable String token, HttpServletRequest request, @RequestBody PasswordResetRequest passwordResetRequest) {
        boolean success = userService.resetPassword(token, request, passwordResetRequest.getPassword());

        if (success) {
            passwordResetServiceToken.tokenUsed(token, request);

            return ResponseEntity.ok().build();
        }

        return ResponseEntity.badRequest().body("Invalid or expired token.");
    }

    /**
     * Updates the timestamp of the last activity of a user.
     *
     * @param userId the ID of the user to be updated
     * @return ResponseEntity with status 200 OK
     */
    @PostMapping("/activity")
    public ResponseEntity<Void> updateUserActiveStatus(@RequestBody String userId) {
        if(userId == null || userId.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        userService.updateUserActiveStatus(userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Retrieves the activity timestamps of all users.
     *
     * @return ResponseEntity containing a map of usernames and their last activity timestamps
     */
    @GetMapping("/activity")
    public ResponseEntity<Map<String, LocalDateTime>> getAllUserActivity() {
        return ResponseEntity.ok().body(userService.getAllActiveUsers());
    }

    /**
     * Checks if a password reset token is valid.
     * @param token the password reset token to validate.
     * @param request the HTTP request containing additional context (such as IP address) for the token validation operation.
     * @return ResponseEntity with status 200 OK if the token is valid, or 410 GONE if it is not valid or has expired.
     */
    @GetMapping("/token-validation/{token}")
    public ResponseEntity<Void> isPasswordResetTokenValid(@PathVariable String token, HttpServletRequest request) {
        if (passwordResetServiceToken.isValidToken(token))
            return ResponseEntity.ok().build();

        return ResponseEntity.status(HttpStatus.GONE).build();
    }
}
