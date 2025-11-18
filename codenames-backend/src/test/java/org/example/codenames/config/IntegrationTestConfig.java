package org.example.codenames.config;

import org.example.codenames.socket.service.api.SocketService;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import static org.mockito.Mockito.mock;

/**
 * Test configuration to provide mock beans for integration tests.
 * This configuration is only active when the 'test' profile is enabled.
 */
@TestConfiguration
@Profile("test")
public class IntegrationTestConfig {

    /**
     * Provides a mock SocketService bean to prevent Socket.IO connection attempts during tests.
     * The @Primary annotation ensures this bean takes precedence over the real implementation.
     *
     * @return a mocked SocketService instance
     */
    @Bean
    @Primary
    public SocketService socketService() {
        return mock(SocketService.class);
    }
}

