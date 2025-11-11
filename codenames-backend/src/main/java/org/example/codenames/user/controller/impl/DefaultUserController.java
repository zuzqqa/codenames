package org.example.codenames.user.controller.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.example.codenames.email.service.api.EmailService;
import org.example.codenames.jwt.JwtService;
import org.example.codenames.socket.service.api.SocketService;
import org.example.codenames.tokens.passwordResetToken.service.api.PasswordResetServiceToken;
import org.example.codenames.user.controller.api.UserController;
import org.example.codenames.user.entity.PasswordResetRequest;
import org.example.codenames.user.entity.User;
import org.example.codenames.user.entity.dto.GetFriendDataResponse;
import org.example.codenames.user.entity.dto.GetUserProfileDetailsResponse;
import org.example.codenames.user.entity.dto.GetUserResponse;
import org.example.codenames.user.entity.dto.GetUsernamesResponse;
import org.example.codenames.user.entity.mapper.UserMapper;
import org.example.codenames.user.service.api.UserService;
import org.example.codenames.userDetails.auth.AuthRequest;
import org.example.codenames.userDetails.auth.AuthResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.io.IOException;
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
    private final UserService userService;
    private final SocketService socketService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final JavaMailSender mailSender;
    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;
    @Value("${backend.url:http://localhost:8080}")
    private String backendUrl;

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

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/username/{token}")
    public ResponseEntity<Map<String, String>> getUserByToken(@PathVariable String token) {
        String username = jwtService.ExtractUsername(token);
        Map<String, String> response = new HashMap<>();
        response.put("username", username);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GetUserResponse> updateUser(@PathVariable String id, @RequestBody User updatedUser) {
        Optional<GetUserResponse> user = userService.updateUser(id, updatedUser);
        return user.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUserById(@PathVariable String id) {
        userService.deleteUserById(id);
        return ResponseEntity.noContent().build();
    }

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
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse("Invalid username or password."));
        }
    }

    @GetMapping("/get-username")
    public ResponseEntity<String> getUsernameByToken(@RequestHeader(value = "Authorization", required = false) String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.ok("null");
        }

        token = token.substring(7);

        return ResponseEntity.ok(jwtService.getUsernameFromToken(token));
    }

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

    @PostMapping("/create-guest")
    public ResponseEntity<String> createGuest(HttpServletResponse response) {
        String username = userService.generateUniqueUsername();

        User guest = User.builder()
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

    @GetMapping("profile/{id}")
    public ResponseEntity<GetUserProfileDetailsResponse> getUserProfile(@PathVariable String id) {
        return userService.getUserById(id).map(user -> ResponseEntity.ok(UserMapper.toGetUserProfileResponse(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<GetUsernamesResponse> searchUsers(@RequestParam String username) {
        GetUsernamesResponse users = UserMapper.toGetUsernamesResponse(userService.searchActiveUsersByUsername(username));
        return ResponseEntity.ok(users);
    }

    @PostMapping("/send-request/{receiverUsername}")
    public ResponseEntity<Void> sendFriendRequest(@PathVariable String receiverUsername, @RequestParam String senderUsername) {
        userService.sendFriendRequest(senderUsername, receiverUsername);
        try {
            // emit with (sender, receiver) ordering so payload contains {from: sender, to: receiver}
            socketService.emitFriendRequestEvent(senderUsername, receiverUsername);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to emit friend request event", e);
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/decline-request/{senderUsername}")
    public ResponseEntity<Void> declineFriendRequest(@PathVariable String senderUsername, @RequestParam String receiverUsername) {
        userService.declineFriendRequest(receiverUsername, senderUsername);
        try {
            // emit decline with (sender, receiver) ordering
            socketService.emitFriendRequestDeclineEvent(senderUsername, receiverUsername);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to emit friend request decline event", e);
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/accept-request/{senderUsername}")
    public ResponseEntity<Void> acceptFriendRequest(@PathVariable String senderUsername, @RequestParam String receiverUsername) {
        userService.acceptFriendRequest(receiverUsername, senderUsername);
        try {
            // emit accept with (sender, receiver) ordering
            socketService.emitFriendRequestAcceptEvent(senderUsername, receiverUsername);
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/remove-friend/{friendUsername}")
    public ResponseEntity<Void> removeFriend(@PathVariable String friendUsername, @RequestParam String userUsername) {
        userService.removeFriend(userUsername, friendUsername);
        try {
            // notify the removed user about being removed
            socketService.emitRemoveFriendEvent(userUsername, friendUsername);
        } catch (JsonProcessingException e) {
            // log but don't fail the request
            throw new RuntimeException("Failed to emit friend removed event", e);
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{username}/friend-requests")
    public ResponseEntity<GetFriendDataResponse> getFriendRequests(@PathVariable String username) {
        return ResponseEntity.ok(userService.getFriendData(username));
    }

    @PostMapping("/reset-password/{token}")
    public ResponseEntity<String> updatePassword(@PathVariable String token, HttpServletRequest request, @RequestBody PasswordResetRequest passwordResetRequest) {
        boolean success = userService.resetPassword(token, request, passwordResetRequest.getPassword());

        if (success) {
            passwordResetServiceToken.tokenUsed(token, request);

            return ResponseEntity.ok().build();
        }

        return ResponseEntity.badRequest().body("Invalid or expired token.");
    }

    @PostMapping("/activity")
    public ResponseEntity<Void> updateUserActiveStatus(@RequestBody String userId) {
        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        userService.updateUserActiveStatus(userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/activity")
    public ResponseEntity<Map<String, LocalDateTime>> getAllUserActivity() {
        return ResponseEntity.ok().body(userService.getAllActiveUsers());
    }

    @GetMapping("/token-validation/{token}")
    public ResponseEntity<Void> isPasswordResetTokenValid(@PathVariable String token, HttpServletRequest request) {
        if (passwordResetServiceToken.isValidToken(token))
            return ResponseEntity.ok().build();

        return ResponseEntity.status(HttpStatus.GONE).build();
    }
}
