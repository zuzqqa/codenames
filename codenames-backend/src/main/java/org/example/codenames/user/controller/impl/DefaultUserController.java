package org.example.codenames.user.controller.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;

import org.example.codenames.jwt.JwtService;
import org.example.codenames.user.entity.User;
import org.example.codenames.user.controller.api.UserController;
import org.example.codenames.user.repository.api.UserRepository;
import org.example.codenames.user.service.api.UserService;
import org.example.codenames.userDetails.AuthRequest;

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

import static org.example.codenames.util.CookieUtils.createAuthCookie;
import static org.example.codenames.util.CookieUtils.createLoggedInCookie;

/**
 * Default implementation of the {@link UserController} interface.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class DefaultUserController implements UserController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
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
                System.out.println("I am not authenticated");
                throw new UsernameNotFoundException("Invalid username or password");
            }
        } catch (Exception e) {
            System.out.println("I am in the exception");
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

    @PostMapping("/reset-password/{uuid}")
    public ResponseEntity<Void> updatePassword(@PathVariable String uuid, @RequestBody String password) {
        userService.resetPassword(uuid, password);
        return ResponseEntity.ok().build();
    }
}
