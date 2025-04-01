package org.example.codenames.user.service.api;

import org.example.codenames.user.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserService {
    // Create a new user
    public void createUser(User user);

    // Read: find user by ID
    public Optional<User> getUserById(String id);

    // Read: find user by username
    public Optional<User> getUserByUsername(String username);

    // Read: get all users
    public List<User> getAllUsers();

    // Update an existing user
    public User updateUser(String id, User updatedUser);

    // Delete a user by ID
    public void deleteUserById(String id);
}
