package org.example.codenames.security;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.example.codenames.discord.service.impl.DiscordGuildService;
import org.example.codenames.jwt.JwtAuthFilter;
import org.example.codenames.jwt.JwtService;
import org.example.codenames.user.entity.User;
import org.example.codenames.user.repository.api.UserRepository;
import org.example.codenames.userDetails.service.UserEntityDetailsService;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
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

    private final UserRepository userRepository;
    private final JwtAuthFilter jwtAuthFilter;
    private final JwtService jwtService;
    private final OAuth2AuthorizedClientService authorizedClientService;
    private final Optional<DiscordGuildService> discordGuildService;
    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

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
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(
                                "/api/users", "/api/users/authenticate", "/api/users/get-id", "/api/users/reset-password/**", "/api/users/token-validation/**", "/api/users/is-guest", "/api/users/activity",
                                "/api/users/get-username", "/api/users/create-guest", "/api/users/username/**",
                                "/api/email/send-report", "/api/game-session/create-game", "/api/game-session/**", "/api/game-session/*/finish",
                                "/api/game-state/**", "/api/cards/**",
                                "/api/users/activate/**", "/api/email/reset-password", "/api/email/reset-password/**",
                                "/api/users/search", "/api/users/send-request/**", "/api/users/*/friend-requests", "/api/users/decline-request/**",
                                "/api/users/accept-request/**", "/api/users/remove-friend/**"
                        ).permitAll()
                        .requestMatchers(
                                "/api/email/send-report",
                                "api/game-session/**", "api/game-state/**", "api/cards/**"
                        ).permitAll()
                        .requestMatchers("/oauth2/**", "/login/oauth2/**", "/api/auth/**", "/api/discord/link/**").permitAll()
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .authenticationProvider(authenticationProvider())
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(u -> u.userService(oAuth2UserService()))
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
            String registrationId = userRequest.getClientRegistration().getRegistrationId();

            if ("google".equals(registrationId)) {
                String email = oauth2User.getAttribute("email");
                if (email == null || email.isBlank()) {
                    throw new IllegalStateException("Google OAuth2 did not return email");
                }

                String username = email.contains("@") ? email.substring(0, email.indexOf('@')) : email;
                userRepository.findByEmail(email).orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setUsername(username);
                    newUser.setGuest(false);
                    newUser.setRoles("USER");
                    newUser.setStatus(User.userStatus.ACTIVE);
                    return userRepository.save(newUser);
                });
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
                OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
                String registrationId = oauthToken.getAuthorizedClientRegistrationId();
                OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

                if ("google".equals(registrationId)) {
                    String email = oauth2User.getAttribute("email");
                    User user = userRepository.findByEmail(email)
                            .orElseThrow(() -> new IllegalStateException("User not found after Google login"));
                    String token = jwtService.generateToken(user.getUsername());
                    response.sendRedirect(frontendUrl + "/auth/callback?token=" + token);
                    return;
                }

                if ("discord".equals(registrationId)) {
                    String appToken = null;
                    if (request.getCookies() != null) {
                        for (var c : request.getCookies()) {
                            if ("APP_LINK_JWT".equals(c.getName())) {
                                appToken = c.getValue();
                                break;
                            }
                        }
                    }
                    if (appToken == null) {
                        response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing APP_LINK_JWT cookie");
                        return;
                    }

                    String appUsername = jwtService.getUsernameFromToken(appToken);
                    User appUser = userRepository.findByUsername(appUsername)
                            .orElseThrow(() -> new IllegalStateException("App user not found for link"));

                    String discordUserId = oauth2User.getAttribute("id");
                    if (discordUserId == null) {
                        response.sendError(HttpServletResponse.SC_BAD_GATEWAY, "No Discord ID in response");
                        return;
                    }

                    appUser.setDiscordUserId(discordUserId);
                    userRepository.save(appUser);

                    OAuth2AuthorizedClient client =
                            authorizedClientService.loadAuthorizedClient(registrationId, principalName(authentication));
                    if (client != null && client.getAccessToken() != null) {
                        String userAccessToken = client.getAccessToken().getTokenValue();
                        discordGuildService.ifPresent(svc -> {
                            try {
                                svc.addMember(discordUserId, userAccessToken);
                            } catch (Exception ignore) {
                            }
                        });
                    }

                    response.sendRedirect(frontendUrl + "/settings/integrations?discord=linked");
                    return;
                }

                response.sendRedirect(frontendUrl);
            } catch (Exception e) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                e.printStackTrace();
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"" + e.getMessage() + "\"}");
                response.getWriter().flush();
            }
        };
    }

    private String principalName(Authentication authentication) {
        return authentication.getName();
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
