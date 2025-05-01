package org.example.codenames.chat.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Configuration class for WebSocket messaging using STOMP protocol.
 * Enables a message broker and registers WebSocket endpoints.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Value("${frontend.origins:http://localhost:5173}")
    private String[] allowedOrigins;

    /**
     * Configures the message broker with destination prefixes for clients and the application.
     *
     * @param config The {@link MessageBrokerRegistry} used to configure message handling.
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/game"); // Enables a simple in-memory message broker
        config.setApplicationDestinationPrefixes("/chat"); // Prefix for messages sent to the application
    }

    /**
     * Registers STOMP endpoints for WebSocket connections and configures allowed origins.
     *
     * @param registry The {@link StompEndpointRegistry} used to register WebSocket endpoints.
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("*") // Allows WebSocket connections from the specified origin
                .withSockJS(); // Enables SockJS fallback for browsers that do not support WebSockets
    }
}