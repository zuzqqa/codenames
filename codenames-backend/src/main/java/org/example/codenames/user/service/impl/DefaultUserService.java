package org.example.codenames.user.service.impl;

import io.jsonwebtoken.Jws;
import jakarta.servlet.http.Cookie;
import org.example.codenames.user.entity.User;
import org.example.codenames.user.repository.api.UserRepository;
import org.example.codenames.user.service.api.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DefaultUserService implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    @Autowired
    public DefaultUserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void createUser(User user) {
        if (!user.isGuest()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        userRepository.save(user);
    }

    @Override
    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    @Override
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public void updateServiceId(String email, String serviceId) {
        userRepository.findByUsername(email)
                .ifPresent(user -> {
                    user.setResetId(serviceId);
                    userRepository.save(user);
                });
    }

    @Override
    public void resetPassword(String uuid, String password) {
        userRepository.findByResetId(uuid)
                .ifPresent(user -> {
                    System.out.println(user.getUsername());
                    System.out.println("New password: " + password);
                    String encodedPassword = passwordEncoder.encode(password);
                    System.out.println("New encoded password: " + encodedPassword);
                    user.setPassword(encodedPassword);
                    System.out.println("User password: " + user.getPassword());
                    user.setResetId(null);
                    userRepository.save(user);
                });
    }

    @Override
    public User updateUser(String id, User updatedUser) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setUsername(updatedUser.getUsername());
                    user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
                    return userRepository.save(user);
                })
                .orElse(null);
    }

    @Override
    public void deleteUserById(String id) {
        userRepository.deleteById(id);
    }
}
