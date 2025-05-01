package org.example.codenames.security;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import org.example.codenames.jwt.JwtAuthFilter;
import org.example.codenames.jwt.JwtService;
import org.example.codenames.user.entity.User;
import org.example.codenames.user.repository.api.UserRepository;
import org.example.codenames.userDetails.UserEntityDetailsService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.Optional;

/**
 * Security configuration class that defines authentication and authorization settings for the application.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class ConfigSecurity {
    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    private final UserRepository userRepository;
    private final JwtAuthFilter jwtAuthFilter;
    private final JwtService jwtService;

    /**
     * Bean definition for UserEntityDetailsService, which loads user-specific data.
     *
     * @return an instance of UserEntityDetailsService
     */
    @Bean
    public UserEntityDetailsService userEntityDetailsService() {
        return new UserEntityDetailsService(userRepository);
    }

    /**
     * Configures the security filter chain, setting authorization rules and adding authentication filters.
     *
     * @param http the HttpSecurity instance to configure
     * @return a configured SecurityFilterChain
     * @throws Exception if a configuration error occurs
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http.csrf(csrf -> csrf.disable())
                //.cors().and()     // Opcjonalnie: dodanie obsługi CORS
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(
                                "/api/users", "/api/users/authenticate", "/api/users/getId", "/api/users/reset-password/**",
                                "/api/users/getUsername", "/api/users/createGuest", "/api/users/username/**",
                                "/api/email/send-report", "/api/game-session/create", "/api/game-session/**",
                                "/api/game-state/**", "/api/cards/**",
                                "/api/users/activate/**", "/api/email/reset-password", "/api/email/reset-password/**",
                                "/api/users/search", "/api/users/sendRequest/**", "/api/users/*/friendRequests", "/api/users/declineRequest/**",
                                "/api/users/acceptRequest/**",  "/api/users/removeFriend/**"
                        ).permitAll()
                        .requestMatchers(
                                "/api/email/send-report",
                                "api/game-session/**", "api/game-state/**", "api/cards/**"
                        ).permitAll()
                        .requestMatchers("/oauth2/**", "/api/auth/**").permitAll()
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authenticationProvider(authenticationProvider())
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo.userService(oAuth2UserService()))
                        .successHandler(authenticationSuccessHandler())
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    /**
     * Bean definition for OIDC User Service.
     *
     * @return an instance of OidcUserService
     */
    @Bean
    public OidcUserService oidcUserService() {
        return new OidcUserService();
    }

    /**
     * Creates an OAuth2UserService bean responsible for handling OAuth2 authentication.
     * This service retrieves user details from Google and ensures that a corresponding
     * user exists in the database.
     *
     * @return an instance of {@link OAuth2UserService} that loads user details from OAuth2.
     */
    @Bean
    public OAuth2UserService<OAuth2UserRequest, OAuth2User> oAuth2UserService() {
        return userRequest -> {
            OAuth2User oauth2User = new DefaultOAuth2UserService().loadUser(userRequest);

            String email = oauth2User.getAttribute("email");
            String username = email.split("@")[0];

            Optional<User> existingUser = userRepository.findByEmail(email);

            if (existingUser.isEmpty()) {
                User newUser = new User();

                newUser.setEmail(email);
                newUser.setUsername(username);
                newUser.setGuest(false);
                newUser.setRoles("USER");
                newUser.setStatus(User.userStatus.ACTIVE);

                userRepository.save(newUser);
            }

            return oauth2User;
        };
    }

    /**
     * Creates an authentication success handler that processes successful OAuth2 logins.
     * Generates a JWT token, sets authentication cookies, and redirects the user to the frontend.
     *
     * @return an {@link AuthenticationSuccessHandler} that manages successful authentication.
     */
    @Bean
    public AuthenticationSuccessHandler authenticationSuccessHandler() {
        return (request, response, authentication) -> {
            try {
                OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
            String email = oauth2User.getAttribute("email");

            Optional<User> existingUser = userRepository.findByEmail(email);

            String token = jwtService.generateToken(existingUser.get().getUsername());
            
            response.setStatus(HttpServletResponse.SC_OK);
            response.setContentType("application/json");
    
            String jsonResponse = String.format(
            "{\"message\":\"success\", \"token\":\"%s\"}",
            token
            );

            response.getWriter().write(jsonResponse);
            response.getWriter().flush();
            }
            catch (Exception e){
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"" + e.getMessage() + "\"}");
                response.getWriter().flush();
            }
        };
    }


    /**
     * Bean definition for password encoding using BCrypt.
     *
     * @return an instance of BCryptPasswordEncoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configures the authentication provider using DAO-based authentication.
     *
     * @return an instance of AuthenticationProvider
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userEntityDetailsService());
        provider.setPasswordEncoder(passwordEncoder());

        return provider;
    }

    /**
     * Configures the authentication manager using the provided authentication configuration.
     *
     * @param authenticationConfiguration the authentication configuration
     * @return an instance of AuthenticationManager
     * @throws Exception if a configuration error occurs
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
