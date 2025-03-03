package org.example.codenames.unitTests;

import org.example.codenames.user.entity.User;
import org.example.codenames.user.repository.api.UserRepository;
import org.example.codenames.userDetails.UserEntityDetailsService;
import org.example.codenames.userDetails.UserEntityUserDetails;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

/**
 * Unit tests for the {@link UserEntityDetailsService} class.
 */
@ExtendWith(MockitoExtension.class)
public class UserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserEntityDetailsService userEntityDetailsService;

    @Test
    public void shouldLoadUserByUsername() {
        String username = "username";
        User user = User.builder()
                .id("1")
                .username(username)
                .password("password")
                .email("example@gmail.com")
                .roles("ROLE_EXAMPLE")
                .build();
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));

        UserDetails userDetails = userEntityDetailsService.loadUserByUsername(username);

        assertEquals(username, userDetails.getUsername());
    }

    @Test
    public void shouldThrowUsernameNotFoundException() {
        String username = "nonexistent";
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> userEntityDetailsService.loadUserByUsername(username));
    }
}