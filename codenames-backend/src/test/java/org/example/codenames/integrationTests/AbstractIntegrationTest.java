package org.example.codenames.integrationTests;

import com.hazelcast.core.Hazelcast;
import org.example.codenames.CodenamesApplication;
import org.example.codenames.email.service.api.EmailService;
import org.example.codenames.jwt.JwtService;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.TestPropertySource;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.time.Duration;

/**
 * Base abstract class for integration tests.
 * Provides shared MongoDB container and MockBean configuration to ensure
 * all integration tests share the same ApplicationContext.
 */
@Testcontainers
@SpringBootTest(classes = CodenamesApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(locations = "classpath:application-test.properties")
public abstract class AbstractIntegrationTest {

    public static MongoDBContainer mongo = new MongoDBContainer(DockerImageName.parse("mongo:5"))
            .withExposedPorts(27017)
            .waitingFor(Wait.forLogMessage(".*Waiting for connections.*", 1))
            .withStartupTimeout(Duration.ofSeconds(60));

    static {
        // Start the mongo container as early as possible (static initializer)
        // so DynamicPropertySource can query its host/port before the Spring
        // ApplicationContext is created.
        mongo.start();

        // install a JVM shutdown hook to shut down Hazelcast only when the JVM exits
        // This avoids shutting Hazelcast down after each integration test class which
        // can leave subsequent test classes with inactive Hazelcast instances.
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            try {
                Hazelcast.shutdownAll();
            } catch (Throwable ignored) {
                // ignore any errors during JVM shutdown
            }
        }));
    }

    @MockBean
    protected EmailService emailService;

    @MockBean
    protected JwtService jwtService;

    @DynamicPropertySource
    static void setProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.mongodb.uri",
                () -> "mongodb://" + mongo.getHost() + ":" + mongo.getMappedPort(27017) + "/CodenamesDB");
    }

    // ...existing code...
}
