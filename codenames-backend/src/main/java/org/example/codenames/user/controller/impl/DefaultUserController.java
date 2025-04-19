package org.example.codenames.user.controller.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;

import org.example.codenames.jwt.JwtService;
import org.example.codenames.user.entity.FriendRequestsDTO;
import org.example.codenames.user.entity.PasswordResetRequest;
import org.example.codenames.user.entity.User;
import org.example.codenames.user.controller.api.UserController;
import org.example.codenames.user.service.api.UserService;
import org.example.codenames.userDetails.AuthRequest;
import static org.example.codenames.util.CookieUtils.createAuthCookie;
import static org.example.codenames.util.CookieUtils.createLoggedInCookie;

import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.io.IOException;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

import java.util.*;

/**
 * Default implementation of the {@link UserController} interface.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class DefaultUserController implements UserController {
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
     * @param response the HTTP response to add the authentication cookie
     * @return ResponseEntity with status 200 OK
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> createUser(@RequestBody User user, HttpServletResponse response, @RequestParam String language) throws MessagingException, IOException {
        Optional<String> errorMessage = userService.createUser(user);

        if (errorMessage.isPresent()) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", errorMessage.get());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }

        String token = jwtService.generateToken(user.getUsername());

        if (!user.isGuest() && !Objects.equals(user.getRoles(), "ROLE_ADMIN")) {
            String activationLink = "http://localhost:8080/api/users/activate/" + token;

            ClassPathResource resource = new ClassPathResource("mail-templates/activate_account_templates/activate_account_" + language + ".html");
            String htmlContent = new String(Files.readAllBytes(resource.getFile().toPath()), StandardCharsets.UTF_8);

            htmlContent = htmlContent.replace("${activationLink}", activationLink);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(user.getEmail());
            helper.setSubject(Objects.equals(language, "pl") ? "Aktywacja konta" : "Account activation");
            helper.setText(htmlContent, true);

            mailSender.send(message);
        }

        if (user.isGuest() || Objects.equals(user.getRoles(), "ROLE_ADMIN")) {
            response.addCookie(createAuthCookie(token, true));
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

            return new RedirectView("http://localhost:5173/login?activated=true&username=" + username);
        } catch (Exception e) {
            return new RedirectView("http://localhost:5173/register?activated=false");
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
     * @param response    the HTTP response to add the authentication cookie
     * @return ResponseEntity with status 200 OK
     */
    @PostMapping("/authenticate")
    public ResponseEntity<String> authenticateAndSetCookie(@RequestBody AuthRequest authRequest, HttpServletResponse response) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
            );
            if (authentication.isAuthenticated()) {

                if(!userService.isAccountActivated(authRequest.getUsername())){
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("The account is not active. Check your email and activate your account.");
                }
              
                String token = jwtService.generateToken(authRequest.getUsername());

                response.addCookie(createAuthCookie(token, true));
                response.addCookie(createLoggedInCookie(true));

                return ResponseEntity.ok().build();
            } else {
                throw new UsernameNotFoundException("Invalid username or password");
            }
        } catch (Exception e) {
            throw new UsernameNotFoundException("Invalid username or password");
        }
    }

    /**
     * Logs out the user by clearing the authentication cookie.
     *
     * @param response the HTTP response to remove the authentication cookie
     * @return ResponseEntity with status 200 OK
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        response.addCookie(createAuthCookie(null, false));
        response.addCookie(createLoggedInCookie(false));

        return ResponseEntity.ok().build();
    }

    /**
     * Retrieves the username from the authentication token stored in a cookie.
     *
     * @param token the authentication token from the cookie
     * @return ResponseEntity containing the username
     */
    @GetMapping("/getUsername")
    public ResponseEntity<String> getUsernameByToken(@CookieValue(value = "authToken", required = false) String token) {
        if (token == null) {
            return ResponseEntity.ok("null");
        }

        return ResponseEntity.ok(jwtService.getUsernameFromToken(token));
    }

    /**
     * Retrieves the user ID from the authentication token stored in a cookie.
     *
     * @param token the authentication token from the cookie
     * @return ResponseEntity containing the user ID or 404 if not found
     */
    @GetMapping("/getId")
    public ResponseEntity<String> getIdByToken(@CookieValue(value = "authToken", required = false) String token) {
        if (token == null) {
            return ResponseEntity.ok("null");
        }
        String username = jwtService.getUsernameFromToken(token);
        Optional<User> user = userService.getUserByUsername(username);

        return user.map(User::getId).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Creates a guest user and assigns a temporary authentication token.
     *
     * @param response the HTTP response to add the authentication cookie
     * @return ResponseEntity with status 200 OK
     */
    @PostMapping("/createGuest")
    public ResponseEntity<Void> createGuest(HttpServletResponse response) {
        String username = userService.generateUniqueUsername();

        User guest = User.builder()
                .username(username)
                .password("")
                .roles("ROLE_GUEST")
                .isGuest(true)
                .build();

        userService.createUser(guest);

        String token = jwtService.generateToken(guest.getUsername());

        response.addCookie(createAuthCookie(token, true));
        response.addCookie(createLoggedInCookie(true));

        return ResponseEntity.ok().build();
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
    @PostMapping("/sendRequest/{receiverUsername}")
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
    @PostMapping("/declineRequest/{senderUsername}")
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
    @PostMapping("/acceptRequest/{senderUsername}")
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
    @DeleteMapping("/removeFriend/{friendUsername}")
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
    @GetMapping("/{username}/friendRequests")
    public ResponseEntity<FriendRequestsDTO> getFriendRequests(@PathVariable String username) {
        System.out.println("entering getFriendRequests function");
        Optional<User> user = userService.getUserByUsername(username);
        if (user.isPresent()) {
            User u = user.get();
            FriendRequestsDTO dto = new FriendRequestsDTO(
                    u.getFriends(),
                    u.getSentRequests(),
                    u.getReceivedRequests()
            );
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
            return ResponseEntity.ok().build();
        }

        return ResponseEntity.badRequest().body("Invalid or expired token.");
    }

    /**
     * Checks if the currently authenticated user is a guest.
     *
     * @param token the authentication token from the cookie
     * @return ResponseEntity containing true if the user is a guest or not authenticated, false otherwise
     */
    @GetMapping("/isGuest")
    public ResponseEntity<Boolean> isGuest(@CookieValue(value = "authToken", required = false) String token) {
        if (token == null) {
            return ResponseEntity.ok(true);
        }

        String username = jwtService.getUsernameFromToken(token);
        Optional<User> user = userService.getUserByUsername(username);

        return ResponseEntity.ok(user.map(User::isGuest).orElse(true));
    }

}
