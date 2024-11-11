package org.example.codenames.user.controller.api;

import org.example.codenames.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

public interface UserController {

    // Create a new user
    public void createUser(User user);

    // Get a user by ID
    public ResponseEntity<User> getUserById(String id);

    // Get all users
    public List<User> getAllUsers();

    // Update a user by ID
    public ResponseEntity<User> updateUser(String id, User updatedUser);

    // Delete a user by ID
    public ResponseEntity<Void> deleteUserById(String id);
}
