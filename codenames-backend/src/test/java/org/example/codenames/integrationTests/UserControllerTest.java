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
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.shaded.com.fasterxml.jackson.core.JsonProcessingException;
import org.testcontainers.shaded.com.fasterxml.jackson.databind.ObjectMapper;
import org.testcontainers.utility.DockerImageName;

import java.time.Duration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Testcontainers
@SpringBootTest(classes = CodenamesApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class UserControllerTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserController userController;

    @MockBean
    private JwtService jwtService;

    @Autowired
    private MockMvc mvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public static MongoDBContainer mongo = new MongoDBContainer(DockerImageName.parse("mongo:5"))
            .withExposedPorts(27017)
            .waitingFor(Wait.forLogMessage(".*Waiting for connections.*", 1))
            .withStartupTimeout(Duration.ofSeconds(60));

    @DynamicPropertySource
    static void mongoProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.mongodb.uri",
                () -> "mongodb://" + mongo.getHost() + ":" + mongo.getMappedPort(27017) + "/CodenamesDB");
    }

    @BeforeAll
    static void setup() {
        mongo.start();
    }

    @Test
    public void shouldAddUser() throws Exception {
        User user = User.builder()
                .username("test")
                .password("test")
                .email("example@gmail.com")
                .build();

        mvc.perform(post("/api/user")
                        .header("Origin", "http://localhost:8080")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk());

    }
}
