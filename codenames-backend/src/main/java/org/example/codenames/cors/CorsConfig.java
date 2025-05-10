package org.example.codenames.cors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration class for Cross-Origin Resource Sharing (CORS).
 * Defines allowed origins, methods, headers, and credentials for HTTP requests.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Value("${frontend.origins1:http://localhost:5173, http://localhost:8080}")
    private String[] allowedOrigins;

    /**
     * Configures CORS mappings for the application.
     * Allows specified origins, HTTP methods, and headers to access resources.
     *
     * @param registry The {@link CorsRegistry} used to configure CORS settings.
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}

