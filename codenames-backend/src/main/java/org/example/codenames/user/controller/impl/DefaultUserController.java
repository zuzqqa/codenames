package org.example.codenames.user.controller.impl;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.example.codenames.jwt.JwtService;
import org.example.codenames.user.entity.User;
import org.example.codenames.user.controller.api.UserController;
import org.example.codenames.user.repository.api.UserRepository;
import org.example.codenames.user.service.api.UserService;
import org.example.codenames.userDetails.AuthRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class DefaultUserController implements UserController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<Void> createUser(@RequestBody User user, HttpServletResponse response) {
        userService.createUser(user);
        String token = jwtService.generateToken(user.getUsername());
        response.addCookie(setAuthCookie(token, true));
        return ResponseEntity.ok().build();
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

    // Update a user by ID
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody User updatedUser) {
        User user = userService.updateUser(id, updatedUser);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUserById(@PathVariable String id) {
        userService.deleteUserById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/authenticate")
    public ResponseEntity<Void> authenticateAndSetCookie(@RequestBody AuthRequest authRequest, HttpServletResponse response) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
            );
            if (authentication.isAuthenticated()) {
                String token = jwtService.generateToken(authRequest.getUsername());
                response.addCookie(setAuthCookie(token, true));
                return ResponseEntity.ok().build();
            } else {
                throw new UsernameNotFoundException("Invalid username or password");
            }
        } catch (Exception e) {
            throw new UsernameNotFoundException("Invalid username or password");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("authToken", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Set true for https
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(setAuthCookie(null, false));

        return ResponseEntity.ok().build();
    }

    @GetMapping("/getUsername")
    public ResponseEntity<String> getUsernameByToken(@CookieValue(value = "authToken", required = false) String token) {
        if (token == null) {
            return ResponseEntity.ok("null");
        }
        return ResponseEntity.ok(jwtService.getUsernameFromToken(token));
    }

    @GetMapping("/getId")
    public ResponseEntity<String> getIdByToken(@CookieValue(value = "authToken", required = false) String token) {
        if (token == null) {
            return ResponseEntity.ok("null");
        }
        String username = jwtService.getUsernameFromToken(token);
        Optional<User> user = userService.getUserByUsername(username);
        return user.map(User::getId).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/createGuest")
    public ResponseEntity<Void> createGuest(HttpServletResponse response) {
        String guestId = "guest" + System.currentTimeMillis();
        User guest = User.builder()
                .username(guestId)
                .password("")
                .roles("ROLE_GUEST")
                .isGuest(true)
                .build();

        userService.createUser(guest);

        String token = jwtService.generateToken(guest.getUsername());
        response.addCookie(setAuthCookie(token, true));

        return ResponseEntity.ok().build();
    }

    private Cookie setAuthCookie(String token, boolean loggingIn) {
        Cookie cookie = new Cookie("authToken", token);
        // cookie.setHttpOnly(true); this bullshit unables me to read the cookie in the frontend        That was the point since we don't want to expose the token to JavaScript
        cookie.setSecure(false); // Set to true for https
        cookie.setPath("/");
        if (loggingIn) {
            cookie.setMaxAge(36000);
        }
        else {
            cookie.setMaxAge(0);
        }
        return cookie;
    }

    @PostMapping("/reset-password/{uuid}")
    public ResponseEntity<Void> updatePassword(@PathVariable String uuid, @RequestBody String password) {
        System.out.println("I am updating endpoint");
        userService.resetPassword(uuid, password);
        return ResponseEntity.ok().build();
    }
}
