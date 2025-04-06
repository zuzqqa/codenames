package org.example.codenames.cors;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration class for Cross-Origin Resource Sharing (CORS).
 * Defines allowed origins, methods, headers, and credentials for HTTP requests.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    /**
     * Configures CORS mappings for the application.
     * Allows specified origins, HTTP methods, and headers to access resources.
     *
     * @param registry The {@link CorsRegistry} used to configure CORS settings.
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Applies CORS settings to all endpoints
                .allowedOrigins("http://localhost:5173", "http://localhost:8080") // Allowed frontend origins
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allowed HTTP methods
                .allowedHeaders("*") // Allows all headers
                .allowCredentials(true); // Supports sending credentials (e.g., cookies, authorization headers)
    }
}

