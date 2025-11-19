package org.example.codenames.unitTests;

import com.hazelcast.core.HazelcastInstance;
import org.example.codenames.tokens.passwordResetToken.entity.PasswordResetToken;
import org.example.codenames.tokens.passwordResetToken.repository.api.PasswordResetTokenRepository;
import org.example.codenames.tokens.passwordResetToken.service.api.PasswordResetServiceToken;
import org.example.codenames.user.entity.User;
import org.example.codenames.user.repository.api.UserRepository;
import org.example.codenames.user.service.impl.DefaultUserService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

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

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository; // Mock the PasswordResetTokenRepository

    @InjectMocks
    private DefaultUserService userService;  // Inject mock into UserService

    private User user1;
    private User user2;
    private User user3;

    @BeforeEach
    public void setUp() {
        user1 = User.builder()
                .id("1")
                .username("user1")
                .password("pass1")
                .email("user1@example.com")
                .sentRequests(new ArrayList<>())
                .receivedRequests(new ArrayList<>())
                .friends(new ArrayList<>())
                .status(User.userStatus.ACTIVE)
                .build();

        user2 = User.builder()
                .id("2")
                .username("user2")
                .password("pass2")
                .email("user2@example.com")
                .sentRequests(new ArrayList<>())
                .receivedRequests(new ArrayList<>())
                .friends(new ArrayList<>())
                .status(User.userStatus.ACTIVE)
                .build();

        user3 = User.builder()
                .id("3")
                .username("user3")
                .password("pass3")
                .email("user3@example.com")
                .sentRequests(new ArrayList<>())
                .receivedRequests(new ArrayList<>())
                .friends(new ArrayList<>())
                .status(User.userStatus.INACTIVE)
                .build();
    }

    @Test
    public void shouldCreateUserServiceInstance() {
        assertNotNull(userService);
    }

    @Test
    public void shouldCreateUserRepositoryInstance() {
        assertNotNull(userRepository);
    }

    @Test
    public void shouldCreatePasswordEncoderInstance() {
        assertNotNull(passwordEncoder);
    }

    @Test
    public void shouldCreateHazelcastInstance() {
        assertNotNull(hazelcastInstance);
    }

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

    @Test
    public void shouldGetAllUsers() {
        when(userRepository.findAll()).thenReturn(java.util.List.of(user1, user2, user3));

        java.util.List<User> users = userService.getAllUsers();

        assertNotNull(users);
        assertEquals(3, users.size());
        assertEquals("user1", users.get(0).getUsername());
        assertEquals("user2", users.get(1).getUsername());
        assertEquals("user3", users.get(2).getUsername());
    }

    @Test
    public void shouldSearchActiveUsersByUsername() {
        String searchUsername = "user";
        when(userRepository.findByUsernameContainingAndStatusAndIsGuest(searchUsername, User.userStatus.ACTIVE, false))
                .thenReturn(java.util.List.of(user1, user2));

        java.util.List<User> users = userService.searchActiveUsersByUsername(searchUsername);

        assertNotNull(users);
        assertEquals(2, users.size());
        assertEquals("user1", users.get(0).getUsername());
        assertEquals("user2", users.get(1).getUsername());
    }

    @Test
    public void shouldSendFriendRequest() {
        String senderUsername = "user1";
        String receiverUsername = "user2";

        when(userRepository.findByUsername(senderUsername)).thenReturn(Optional.of(user1));
        when(userRepository.findByUsername(receiverUsername)).thenReturn(Optional.of(user2));

        userService.sendFriendRequest(senderUsername, receiverUsername);

        verify(userRepository).save(user1);
        verify(userRepository).save(user2);

        assertEquals(1, user1.getSentRequests().size());
        assertEquals(1, user2.getReceivedRequests().size());
    }

    @Test
    public void shouldAcceptFriendRequest() {
        String senderUsername = "user1";
        String receiverUsername = "user2";

        user1.getSentRequests().add(receiverUsername);
        user2.getReceivedRequests().add(senderUsername);

        when(userRepository.findByUsername(senderUsername)).thenReturn(Optional.of(user1));
        when(userRepository.findByUsername(receiverUsername)).thenReturn(Optional.of(user2));

        userService.acceptFriendRequest(receiverUsername, senderUsername);

        verify(userRepository).save(user1);
        verify(userRepository).save(user2);

        assertEquals(0, user1.getSentRequests().size());
        assertEquals(0, user2.getReceivedRequests().size());
        assertEquals(1, user1.getFriends().size());
        assertEquals(1, user2.getFriends().size());
    }

    @Test
    public void shouldDeclineFriendRequest() {
        String senderUsername = "user1";
        String receiverUsername = "user2";

        user1.getSentRequests().add(receiverUsername);
        user2.getReceivedRequests().add(senderUsername);

        when(userRepository.findByUsername(senderUsername)).thenReturn(Optional.of(user1));
        when(userRepository.findByUsername(receiverUsername)).thenReturn(Optional.of(user2));

        userService.declineFriendRequest(receiverUsername, senderUsername);

        verify(userRepository).save(user1);
        verify(userRepository).save(user2);

        assertEquals(0, user1.getSentRequests().size());
        assertEquals(0, user2.getReceivedRequests().size());
        assertEquals(0, user1.getFriends().size());
        assertEquals(0, user2.getFriends().size());
    }

    @Test
    public void shouldRemoveFriend() {
        String user1Username = "user1";
        String user2Username = "user2";

        user1.getFriends().add(user2Username);
        user2.getFriends().add(user1Username);

        when(userRepository.findByUsername(user1Username)).thenReturn(Optional.of(user1));
        when(userRepository.findByUsername(user2Username)).thenReturn(Optional.of(user2));

        userService.removeFriend(user1Username, user2Username);

        verify(userRepository).save(user1);
        verify(userRepository).save(user2);

        assertEquals(0, user1.getFriends().size());
        assertEquals(0, user2.getFriends().size());
    }

    @Test
    public void shouldResetPassword() {
        String token = "validToken";
        String userEmail = "user1@example.com";
        String newPassword = "newPassword";
        String encodedPassword = "encodedNewPassword";

        // Mock PasswordResetToken
        PasswordResetToken passwordResetToken = PasswordResetToken.builder().build();
        passwordResetToken.setToken(token);
        passwordResetToken.setUserEmail(userEmail);

        // Mock repository and service behaviors
        when(passwordResetTokenRepository.findByToken(token)).thenReturn(Optional.of(passwordResetToken));
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(user1));
        when(passwordEncoder.encode(newPassword)).thenReturn(encodedPassword);

        // Mock token validation
        PasswordResetServiceToken passwordResetServiceToken = mock(PasswordResetServiceToken.class);
        when(passwordResetServiceToken.isValidToken(token)).thenReturn(true);
        userService = new DefaultUserService(userRepository, passwordEncoder, passwordResetTokenRepository, passwordResetServiceToken, hazelcastInstance);

        boolean result = userService.resetPassword(token, null, newPassword);

        assertEquals(encodedPassword, user1.getPassword());
        assertTrue(result);
        verify(userRepository).save(user1);
    }

    @Test
    public void shouldNotResetPasswordWithInvalidToken() {
        String token = "invalidToken";
        String userEmail = "user1@example.com";
        String newPassword = "newPassword";
        String encodedPassword = "encodedNewPassword";

        // Mock PasswordResetToken
        PasswordResetToken passwordResetToken = PasswordResetToken.builder().build();
        passwordResetToken.setToken(token);
        passwordResetToken.setUserEmail(userEmail);

        // Mock repository behavior
        when(passwordResetTokenRepository.findByToken(token)).thenReturn(Optional.of(passwordResetToken));

        // Mock token validation
        PasswordResetServiceToken passwordResetServiceToken = mock(PasswordResetServiceToken.class);
        when(passwordResetServiceToken.isValidToken(token)).thenReturn(false);
        userService = new DefaultUserService(userRepository, passwordEncoder, passwordResetTokenRepository, passwordResetServiceToken, hazelcastInstance);

        boolean result = userService.resetPassword(token, null, newPassword);

        assertNotEquals(encodedPassword, user1.getPassword());
        assertFalse(result);
        verify(userRepository, never()).save(user1);
    }

    @Test
    public void shouldActivateUser() {
        String username = "user1";
        user1.setStatus(User.userStatus.INACTIVE);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user1));

        userService.activateUser(username);

        assertEquals(User.userStatus.ACTIVE, user1.getStatus());
        verify(userRepository).save(user1);
    }

    @Test
    public void shouldCheckIfAccountIsActivated() {
        String username = "user1";
        user1.setStatus(User.userStatus.ACTIVE);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user1));

        boolean isActive = userService.isAccountActivated(username);

        assertTrue(isActive);
    }

    @Test
    public void shouldCheckIfAccountIsNotActivated() {
        String username = "user1";
        user1.setStatus(User.userStatus.INACTIVE);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user1));

        boolean isActive = userService.isAccountActivated(username);

        assertFalse(isActive);
    }

    @Test
    public void shouldGenerateUniqueUsername() {
        // Mock existsByUsername to always return false (username is unique)
        when(userRepository.existsByUsername(anyString())).thenReturn(false);

        String uniqueUsername = userService.generateUniqueUsername();

        assertNotNull(uniqueUsername);
        assertFalse(uniqueUsername.isEmpty());
        verify(userRepository, atLeastOnce()).existsByUsername(anyString());
    }

    @Test
    public void shouldUpdateUserActiveStatus() {
        String userId = "3";
        var map = mock(com.hazelcast.map.IMap.class);
        when(hazelcastInstance.getMap("activeUsers")).thenReturn(map);

        userService = new DefaultUserService(userRepository, passwordEncoder, passwordResetTokenRepository, mock(PasswordResetServiceToken.class), hazelcastInstance);

        userService.updateUserActiveStatus(userId);

        verify(map).put(eq(userId), any(java.time.LocalDateTime.class));
    }

    @Test
    public void shouldGetAllActiveUsers() {
        var map = mock(com.hazelcast.map.IMap.class);
        when(hazelcastInstance.getMap("activeUsers")).thenReturn(map);
        when(map.keySet()).thenReturn(java.util.Set.of("user1", "user2"));
        when(map.getAll(anySet())).thenReturn(
                java.util.Map.of(
                        "user1", java.time.LocalDateTime.now().minusMinutes(1),
                        "user2", java.time.LocalDateTime.now().minusMinutes(2)
                )
        );

        userService = new DefaultUserService(userRepository, passwordEncoder, passwordResetTokenRepository, mock(PasswordResetServiceToken.class), hazelcastInstance);

        var activeUsers = userService.getAllActiveUsers();

        assertNotNull(activeUsers);
        assertEquals(2, activeUsers.size());
        assertTrue(activeUsers.containsKey("user1"));
        assertTrue(activeUsers.containsKey("user2"));
    }
}
