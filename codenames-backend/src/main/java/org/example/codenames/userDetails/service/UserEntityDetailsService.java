package org.example.codenames.userDetails.service;

import lombok.extern.slf4j.Slf4j;
import org.example.codenames.user.repository.api.UserRepository;
import org.example.codenames.userDetails.model.UserEntityUserDetails;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Implementation of {@link UserDetailsService} that uses {@link UserRepository} to load user details.
 */
@Slf4j
@Service
public class UserEntityDetailsService implements UserDetailsService {
    /**
     * The repository to use to load user details.
     */
    private final UserRepository userRepository;

    /**
     * Constructor that initializes the repository.
     *
     * @param userRepository The repository to use to load user details.
     */
    public UserEntityDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Load user details by username.
     *
     * @param username The username to load user details for.
     * @return The user details.
     * @throws UsernameNotFoundException If the user is not found.
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .map(user -> {
                    return new UserEntityUserDetails(user);
                })
                .orElseThrow(() -> {
                    return new UsernameNotFoundException("User not found");
                });
    }
}
