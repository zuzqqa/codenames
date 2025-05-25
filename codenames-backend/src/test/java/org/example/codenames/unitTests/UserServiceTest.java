package org.example.codenames.unitTests;

import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
import org.example.codenames.user.entity.User;
import org.example.codenames.user.repository.api.UserRepository;
import org.example.codenames.user.service.impl.DefaultUserService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;


import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Basic unit tests for the {@link DefaultUserService} class.
 */

@ExtendWith(MockitoExtension.class)  // Use MockitoExtension to activate Mockito
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;  // Mock the UserRepository

    @Mock
    private PasswordEncoder passwordEncoder;  // Mock the PasswordEncoder

    @Mock
    private HazelcastInstance hazelcastInstance;  // Mock the HazelcastInstance

    @InjectMocks
    private DefaultUserService userService;  // Inject mock into UserService

    @Test
    public void shouldReturnUserById() {
        String userId = "123";
        User mockUser = User.builder().id(userId).username("testUser").build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));  // Mock behavior

        Optional<User> result = userService.getUserById(userId);  // Call the service method

        assertNotNull(result);  // Assert that the result is not null
        assertEquals("testUser", result.get().getUsername());  // Assert that the username is correct
    }

    @Test
    public void shouldReturnNullForNonExistentUser() {
        String userId = "123";
        when(userRepository.findById(userId)).thenReturn(Optional.empty());  // Mock behavior

        Optional<User> result = userService.getUserById(userId);  // Call the service method

        assertNotNull(result);  // Assert that the result is not null
        assertEquals(Optional.empty(), result);  // Assert that the result is empty
    }

    @Test
    public void shouldAddUser() {

        when(passwordEncoder.encode("AlaMaKota")).thenReturn("encodedPassword");

        User user = User.builder().id("123").username("testUser").password("AlaMaKota").email("test@gmail.com").build();
        userService.createUser(user);  // Call the service method

        assertNotNull(user.getId());  // Assert that the user has an ID

        verify(userRepository).save(user);  // Verify that the user was saved

        assertNotNull(userService.getUserById(user.getId()));  // Assert that the user can be retrieved

        assertEquals("encodedPassword", user.getPassword());
    }

    @Test
    public void shouldDeleteUser() {
        String userId = "123";
        User mockUser = User.builder().id(userId).username("testUser").build();

        // Mock repository behavior
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        assertNotNull(userService.getUserById(userId));  // Ensure user exists

        userService.deleteUserById(userId);  // Call delete method

        verify(userRepository).deleteById(userId);  // Verify deletion

        // Ensure user is not found after deletion
        when(userRepository.findById(userId)).thenReturn(Optional.empty());
        assertEquals(Optional.empty(), userService.getUserById(userId));
    }


    @Test
    public void shouldUpdateUser() {
        String userId = "123";
        String oldPassword = "oldPass";
        String newPassword = "AlaMaKota";
        String encodedPassword = "encodedNewPassword";

        User mockUser = User.builder()
                .id(userId)
                .username("testUser")
                .password(oldPassword)
                .build();

        // Mock repository behavior
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        // Mock password encoding
        when(passwordEncoder.encode(newPassword)).thenReturn(encodedPassword);

        User updatedUser = User.builder()
                .id(userId)
                .username("updatedUser")
                .password(newPassword)
                .build();

        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        userService.updateUser(userId, updatedUser);

        // After update, return updated user
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        Optional<User> result = userService.getUserById(userId);
        Assertions.assertTrue(result.isPresent());
        assertEquals("updatedUser", result.get().getUsername());
        assertEquals(encodedPassword, result.get().getPassword());

        // Additional verification
        verify(passwordEncoder).encode(newPassword);
    }


}
