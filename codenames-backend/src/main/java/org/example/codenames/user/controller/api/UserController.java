package org.example.codenames.user.controller.api;

import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.codenames.user.entity.PasswordResetRequest;
import org.example.codenames.user.entity.User;
import org.example.codenames.user.entity.dto.GetFriendDataResponse;
import org.example.codenames.user.entity.dto.GetUserProfileDetailsResponse;
import org.example.codenames.user.entity.dto.GetUserResponse;
import org.example.codenames.user.entity.dto.GetUsernamesResponse;
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

    /**
     * Creates a new user and generates an authentication token.
     *
     * @param user the user to be created
     * @return ResponseEntity with status 200 OK
     */
    ResponseEntity<Map<String, String>> createUser(@RequestBody User user, String language) throws MessagingException, IOException;

    /**
     * Activates a user account based on the provided authentication token.
     *
     * @param token the authentication token that is used to retrieve the username and activate the corresponding user account
     * @return a {@link RedirectView} that redirects the user to the appropriate page
     */
    RedirectView activateAccount(@PathVariable String token);

    /**
     * Retrieves a user by their ID.
     *
     * @param id the ID of the user
     * @return ResponseEntity containing the user or 404 if not found
     */
    ResponseEntity<User> getUserById(String id);

    /**
     * Retrieves all users. Only accessible to admins.
     *
     * @return a list of all users
     */
    List<User> getAllUsers();

    /**
     * Retrieves a username based on the provided authentication token.
     *
     * @param token the JWT token
     * @return ResponseEntity containing the username
     */
    ResponseEntity<Map<String, String>> getUserByToken(String token);

    /**
     * Updates a user by their ID.
     *
     * @param id          the ID of the user
     * @param updatedUser the updated user information
     * @return ResponseEntity containing the updated user or 404 if not found
     */
    ResponseEntity<GetUserResponse> updateUser(String id, User updatedUser);

    /**
     * Deletes a user by their ID. Only accessible to admins.
     *
     * @param id the ID of the user to be deleted
     * @return ResponseEntity with status 204 No Content
     */
    ResponseEntity<Void> deleteUserById(String id);

    /**
     * Authenticates a user and sets an authentication cookie.
     *
     * @param authRequest the authentication request containing username and password
     */
    ResponseEntity<AuthResponse> authenticateAndGenerateJWT(AuthRequest authRequest);

    /**
     * Retrieves the username from the authentication token stored in a header.
     *
     * @param token the authentication token from the header
     * @return ResponseEntity containing the username
     */
    ResponseEntity<String> getUsernameByToken(@RequestHeader(value = "Authorization", required = false) String token);

    /**
     * Retrieves the user ID from the authentication token stored in a header.
     *
     * @param token the authentication token from the header
     * @return ResponseEntity containing the user ID or 404 if not found
     */
    ResponseEntity<String> getIdByToken(@RequestHeader(value = "Authorization", required = false) String token);

    /**
     * Checks if the currently authenticated user is a guest.
     *
     * @param token the authentication token from the header
     * @return ResponseEntity containing true if the user is a guest or not authenticated, false otherwise
     */
    ResponseEntity<Boolean> isGuest(@RequestHeader(value = "Authorization", required = false) String token);

    /**
     * Creates a guest user and assigns a temporary authentication token.
     *
     * @param response the HTTP response to add the authentication cookie
     * @return ResponseEntity with status 200 OK
     */
    ResponseEntity<String> createGuest(HttpServletResponse response);

    /**
     * Retrieves the profile details of a user by their ID.
     *
     * @param id the ID of the user
     * @return ResponseEntity containing the user's profile details or 404 if not found
     */
    ResponseEntity<GetUserProfileDetailsResponse> getUserProfile(@PathVariable String id);

    /**
     * Searches for users with usernames that match the provided string.
     *
     * @param username the username to search for
     * @return ResponseEntity containing the list of matched users
     */
    ResponseEntity<GetUsernamesResponse> searchUsers(@RequestParam String username);

    /**
     * Sends a friend request from one user to another.
     *
     * @param receiverUsername the username of the user receiving the request
     * @param senderUsername   the username of the user sending the request
     * @return ResponseEntity with status 200 OK
     */
    ResponseEntity<Void> sendFriendRequest(@PathVariable String receiverUsername, @RequestParam String senderUsername);

    /**
     * Declines a friend request sent by another user.
     *
     * @param senderUsername   the username of the user who sent the request
     * @param receiverUsername the username of the user declining the request
     * @return ResponseEntity with status 200 OK
     */
    ResponseEntity<Void> declineFriendRequest(@PathVariable String senderUsername, @RequestParam String receiverUsername);

    /**
     * Accepts a friend request sent by another user.
     *
     * @param senderUsername   the username of the user who sent the request
     * @param receiverUsername the username of the user accepting the request
     * @return ResponseEntity with status 200 OK
     */
    ResponseEntity<Void> acceptFriendRequest(@PathVariable String senderUsername, @RequestParam String receiverUsername);

    /**
     * Removes a friend from the user's friend list.
     *
     * @param friendUsername the username of the friend to remove
     * @param userUsername   the username of the user initiating the removal
     * @return ResponseEntity with status 200 OK
     */
    ResponseEntity<Void> removeFriend(@PathVariable String friendUsername, @RequestParam String userUsername);

    /**
     * Retrieves all friend-related lists (friends, sent requests, received requests) for a given user.
     *
     * @param username the username of the user
     * @return ResponseEntity containing a {@link GetFriendDataResponse} or 404 if user not found
     */
    ResponseEntity<GetFriendDataResponse> getFriendRequests(@PathVariable String username);

    /**
     * Resets user password based on the token and new password provided.
     *
     * @param token                the reset token provided by the user.
     * @param request              the HTTP request containing additional context (such as IP address) for the password reset operation.
     * @param passwordResetRequest the entity containing new password.
     * @return ResponseEntity with status 200 OK if password change was successful or 400 BAD REQUEST otherwise
     */
    ResponseEntity<String> updatePassword(@PathVariable String token, HttpServletRequest request, @RequestBody PasswordResetRequest passwordResetRequest);

    /**
     * Updates the timestamp of the last activity of a user.
     *
     * @param userId the ID of the user to be updated
     * @return ResponseEntity with status 200 OK
     */
    ResponseEntity<Void> updateUserActiveStatus(@RequestBody String userId);

    /**
     * Retrieves the activity timestamps of all users.
     *
     * @return ResponseEntity containing a map of usernames and their last activity timestamps
     */
    ResponseEntity<Map<String, LocalDateTime>> getAllUserActivity();

    /**
     * Validates if a password reset token is valid.
     *
     * @param token   the reset token provided by the user.
     * @param request the HTTP request containing additional context for the validation operation.
     * @return ResponseEntity with status 200 OK if the token is valid or 400 BAD REQUEST otherwise
     */
    ResponseEntity<Void> isPasswordResetTokenValid(@PathVariable String token, HttpServletRequest request);
}
