package org.example.codenames.integrationTests;

import org.example.codenames.CodenamesApplication;
import org.example.codenames.jwt.JwtService;
import org.example.codenames.user.controller.api.UserController;
import org.example.codenames.user.entity.User;
import org.example.codenames.user.repository.api.UserRepository;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.shaded.com.fasterxml.jackson.databind.ObjectMapper;

@Testcontainers
@SpringBootTest(classes = CodenamesApplication.class)
@AutoConfigureMockMvc
public class UserControllerTest {

    @Container
    static final MongoDBContainer mongoDBContainer = new MongoDBContainer("mongo:6.0.4")
            .waitingFor(Wait.forListeningPort());



    @DynamicPropertySource
    static void setProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.mongodb.uri", () ->
                "mongodb://" + mongoDBContainer.getHost() + ":" + mongoDBContainer.getMappedPort(27017) + "/testdb"
        );

    }

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserController userController;

    @MockBean
    private JwtService jwtService;

    @Autowired
    private MockMvc mvc;

    private ObjectMapper objectMapper = new ObjectMapper();

    @Test
    public void shouldAddUser() {
        User user = User.builder()
                .username("test")
                .password("test")
                .email("example@gmail.com")
                .build();
        // Add test logic here
    }
}