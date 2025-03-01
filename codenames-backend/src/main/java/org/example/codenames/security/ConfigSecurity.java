package org.example.codenames.security;

import lombok.RequiredArgsConstructor;
import org.example.codenames.auth.service.impl.OAuth2LoginSuccessHandler;
import org.example.codenames.auth.service.impl.OAuth2UserServiceImpl;
import org.example.codenames.jwt.JwtAuthFilter;
import org.example.codenames.jwt.JwtService;
import org.example.codenames.user.repository.api.UserRepository;
import org.example.codenames.user.service.api.UserService;
import org.example.codenames.userDetails.UserEntityDetailsService;
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
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Security configuration class that defines authentication and authorization settings for the application.
 */
@SuppressWarnings("ALL")
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class ConfigSecurity {
    private final UserRepository userRepository;
    private final JwtAuthFilter jwtAuthFilter;
    private final UserService userService;
    private final JwtService jwtService;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

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
        return http.csrf().disable()
                //.cors().and()     //We either have to do this or add requestMatchers for OPTIONS, leaving this for now to explore it further
                .authorizeHttpRequests(authorizeRequests ->
                        authorizeRequests
                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Allow preflight requests
                                .requestMatchers("/api/users", "/api/users/authenticate", "/api/users/getId", "/api/users/getUsername", "/api/users/createGuest", "/api/users/username/**", "/api/users/activate/**").permitAll()
                                .requestMatchers("/api/email/send-report", "/api/game-session/create", "api/game-session/**", "api/game-state/**", "api/cards/**").permitAll()
                                .requestMatchers("/oauth2/**", "/api/auth/**").permitAll()
                                .anyRequest().authenticated() // Allow access to registration and authentication endpoints
                                )
                .sessionManagement(sessionManagement ->
                        sessionManagement
                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(oAuth2UserService())
                        )
                        .successHandler(oAuth2LoginSuccessHandler)
                )

                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    /**
     * Bean definition for password encoding using BCrypt.
     *
     * @return an instance of BCryptPasswordEncoder
     */
    @Bean
    public OAuth2UserService<OAuth2UserRequest, OAuth2User> oAuth2UserService() {
        return new OAuth2UserServiceImpl(userService, jwtService);
    }

    @Bean
    public OidcUserService oidcUserService() {
        return new OidcUserService();
    }

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
