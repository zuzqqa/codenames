package org.example.codenames.user.service.api;

import jakarta.servlet.http.HttpServletRequest;
import org.example.codenames.user.entity.User;
import org.example.codenames.user.entity.dto.GetFriendDataResponse;
import org.example.codenames.user.entity.dto.GetUserResponse;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service for managing users.
 */
public interface UserService {

    /**
     * Creates a new user.
     *
     * @param user the user to be created
     * @return the created user
     */
    Optional<String> createUser(User user);

    /**
     * Retrieves a user by their ID.
     *
     * @param id the ID of the user
     * @return the user, if found
     */
    Optional<User> getUserById(String id);

    /**
     * Retrieves a user by their username.
     *
     * @param username the username of the user
     * @return the user, if found
     */
    Optional<User> getUserByUsername(String username);

    /**
     * Retrieves all users.
     *
     * @return a list of all users
     */
    List<User> getAllUsers();

    /**
     * Updates a user by their ID.
     *
     * @param id          the ID of the user
     * @param updatedUser the updated user
     * @return the updated user, if found
     */
    Optional<GetUserResponse> updateUser(String id, User updatedUser);

    /**
     * Searches for users with an active status and usernames containing the specified substring.
     *
     * @param username the substring to search in usernames
     * @return list of users with matching usernames and ACTIVE status
     */
    List<User> searchActiveUsersByUsername(String username);

    /**
     * Retrieves friend data for a given username.
     *
     * @param username the username of the user
     * @return the friend data response
     */
    GetFriendDataResponse getFriendData(String username);

    /**
     * Sends a friend request from one user to another.
     *
     * @param senderUsername   the username of the sender
     * @param receiverUsername the username of the receiver
     */
    void sendFriendRequest(String senderUsername, String receiverUsername);

    /**
     * Accepts a friend request.
     *
     * @param receiverUsername the username of the user accepting the request
     * @param senderUsername   the username of the user who sent the request
     */
    void acceptFriendRequest(String receiverUsername, String senderUsername);

    /**
     * Declines a friend request.
     *
     * @param receiverUsername the username of the user declining the request
     * @param senderUsername   the username of the user who sent the request
     */
    void declineFriendRequest(String receiverUsername, String senderUsername);

    /**
     * Removes a friend relationship between two users.
     *
     * @param user1Username the username of the first user
     * @param user2Username the username of the second user
     */
    void removeFriend(String user1Username, String user2Username);

    /**
     * Resets the user's password based on the provided token.
     *
     * @param token    the reset token provided by the user
     * @param request  the HTTP request containing additional context (such as IP address) for the password reset operation
     * @param password the new password provided by the user
     * @return {@code true} if password reset was successful, {@code false} otherwise
     */
    boolean resetPassword(String token, HttpServletRequest request, String password);

    /**
     * Deletes a user by their ID.
     *
     * @param id the ID of the user
     */
    void deleteUserById(String id);

    /**
     * Activates a user account.
     * @param username the username of the user to activate
     */
    void activateUser(String username);

    /**
     * Checks whether the account with the given username is activated.
     *
     * @param username the username of the account to check
     * @return {@code true} if the account is activated; {@code false} otherwise
     * @throws UsernameNotFoundException if no user is found with the given username
     */
    boolean isAccountActivated(String username);

    /**
     * Generates a unique username consisting of an adjective and a noun.
     *
     * @return a unique username combining an adjective and a noun, without whitespaces
     */
    String generateUniqueUsername();

    /**
     * Updates the user's active status.
     *
     * @param userId the ID of the user
     */
    void updateUserActiveStatus(String userId);

    /**
     * Retrieves all active users.
     *
     * @return a map of all active users
     */
    Map<String, LocalDateTime> getAllActiveUsers();
}
