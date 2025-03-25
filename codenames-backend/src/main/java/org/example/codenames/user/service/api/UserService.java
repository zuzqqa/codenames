package org.example.codenames.user.service.api;

import com.mongodb.client.MongoIterable;
import org.example.codenames.user.entity.User;
import org.springframework.http.ResponseEntity;

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

    // Update user's utility user ID
    public void updateServiceId(String email, String serviceId);

    // Change password for a user specified by service ID
    public void resetPassword(String uuid, String password);

    // Delete a user by ID
    public void deleteUserById(String id);
}
