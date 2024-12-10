package org.example.codenames;

import org.example.codenames.jwt.JwtService;
import org.example.codenames.user.repository.api.UserRepository;
import org.example.codenames.user.service.api.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class CodenamesApplicationTests {
	@Autowired
	private UserService userService; // Service for handling user data

	@MockBean
	private JwtService jwtService; // Custom service for handling JWT

	@BeforeEach
	void setup() {
		// Setup initial data and mock JWT behavior
	}

	@Test
	void testCreateUser() {
		// Test creating a user document
	}

	@Test
	void testReadUser() {
		// Test reading a user document by ID
	}

	@Test
	void testUpdateUser() {
		// Test updating a user document
	}

	@Test
	void testDeleteUser() {
		// Test deleting a user document
	}

}
