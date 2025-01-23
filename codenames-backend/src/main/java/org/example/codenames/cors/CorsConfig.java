package org.example.codenames.cors;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Pozwól na zapytania z każdego portu na localhost
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:8080") // Określ konkretne źródła
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Dozwolone metody HTTP
                .allowedHeaders("*") // Akceptowanie wszystkich nagłówków
                .allowCredentials(true); // Zezwolenie na przesyłanie ciasteczek
    }
}
