package org.example.codenames.unitTests;

import org.example.codenames.user.entity.User;
import org.example.codenames.user.repository.api.UserRepository;
import org.example.codenames.user.service.impl.DefaultUserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

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
        User mockUser = User.builder().id(userId).username("testUser").password("oldPass").build();

        // Mock repository behavior
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.encode("AlaMaKota")).thenReturn("encodedPassword");

        assertNotNull(userService.getUserById(userId));

        User updatedUser = User.builder().id(userId).username("updatedUser").password("AlaMaKota").build();

        // Ensure that save() returns the updated user
        when(userRepository.save(mockUser)).thenReturn(mockUser);

        userService.updateUser(userId, updatedUser);  // Call update

        // After update, the repository should return the updated user
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        assertEquals("updatedUser", userService.getUserById(userId).get().getUsername());  // Verify update
        assertEquals("encodedPassword", userService.getUserById(userId).get().getPassword());  // Ensure password encoding
    }
}
