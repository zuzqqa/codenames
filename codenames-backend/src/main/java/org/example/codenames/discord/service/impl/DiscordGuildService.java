package org.example.codenames.discord.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.codenames.discord.service.api.DiscordGuildClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * DiscordGuildService implements methods for interacting with the Discord REST API,
 * such as creating voice channels, managing members, and generating invites.
 */
@Service
@RequiredArgsConstructor
public class DiscordGuildService implements DiscordGuildClient {
    /**
     * The base URL for all Discord API v10 requests.
     */
    private static final String API_BASE_URL = "https://discord.com/api/v10";
    /**
     * REST client used for communicating with the Discord API.
     */
    private final RestTemplate restTemplate = new RestTemplate();
    /**
     * Discord guild (server) ID where operations will be performed.
     */
    @Value("${discord.guild-id}")
    private String guildId;
    /**
     * Discord bot token used for authorization in API requests.
     */
    @Value("${discord.bot-token}")
    private String botToken;
    /**
     * Optional category ID for newly created channels.
     * If not set, channels will be created at the top level of the guild.
     */
    @Value("${discord.category-id}")
    private String categoryId;

    /**
     * Adds a user to the Discord guild using their OAuth2 access token.
     *
     * @param discordUserId   The unique Discord user ID.
     * @param userAccessToken The user's OAuth2 access token with the "guilds.join" scope.
     * @throws RuntimeException if the request to Discord fails or configuration is missing.
     */
    public void addMember(String discordUserId, String userAccessToken) {
        ensureConfigured();

        final String url = API_BASE_URL + "/guilds/" + guildId + "/members/" + discordUserId;

        HttpHeaders headers = botHeaders();
        Map<String, String> body = Map.of("access_token", userAccessToken);

        try {
            restTemplate.exchange(url, HttpMethod.PUT, new HttpEntity<>(body, headers), String.class);
        } catch (RestClientException e) {
            throw new RuntimeException("Failed to add Discord user to guild: " + e.getMessage(), e);
        }
    }

    /**
     * Creates a voice channel in the configured Discord guild.
     *
     * @param gameName  The name of the new voice channel.
     * @param userLimit Maximum number of users allowed in the channel.
     * @return The unique ID of the newly created Discord channel.
     * @throws RuntimeException if Discord API returns an error or no channel ID.
     */
    public String createVoiceChannel(String gameName, int userLimit) {
        ensureConfigured();

        final String url = API_BASE_URL + "/guilds/" + guildId + "/channels";

        HttpHeaders headers = botHeaders();

        Map<String, Object> body = new HashMap<>();
        body.put("name", gameName);
        body.put("type", 2);
        body.put("user_limit", userLimit);

        if (categoryId != null && !categoryId.isBlank()) {
            body.put("parent_id", categoryId);
        }

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(body, headers), Map.class);
            Object id = response.getBody() != null ? response.getBody().get("id") : null;
            if (id == null) {
                throw new RuntimeException("Discord API did not return channel id");
            }
            return String.valueOf(id);
        } catch (RestClientException e) {
            throw new RuntimeException("Could not create channel: " + e.getMessage(), e);
        }
    }

    /**
     * Creates an invite link for a given channel.
     *
     * @param channelId The Discord channel ID.
     * @return The full Discord invite URL (e.g. https://discord.gg/XXXXXX).
     * @throws RuntimeException if Discord API returns an error or no invite code.
     */
    public String createInvite(String channelId) {
        ensureConfigured();
        final String url = API_BASE_URL + "/channels/" + channelId + "/invites";

        HttpHeaders headers = botHeaders();
        Map<String, Object> body = new HashMap<>();
        body.put("unique", true);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(body, headers), Map.class);
            Object code = response.getBody() != null ? response.getBody().get("code") : null;
            if (code == null) {
                throw new RuntimeException("Discord API did not return invite code");
            }
            return "https://discord.gg/" + code;
        } catch (RestClientException e) {
            throw new RuntimeException("Could not create invite: " + e.getMessage(), e);
        }
    }

    /**
     * Deletes a Discord channel.
     *
     * @param channelId The ID of the channel to delete.
     * @throws RuntimeException if the Discord API request fails.
     */
    public void deleteChannel(String channelId) {
        ensureConfigured();

        final String url = API_BASE_URL + "/channels/" + channelId;

        HttpHeaders headers = botHeaders();

        try {
            restTemplate.exchange(url, HttpMethod.DELETE, new HttpEntity<>(headers), String.class);
        } catch (RestClientException e) {
            System.err.println("Could not delete channel " + channelId + ": " + e.getMessage());
        }
    }

    /**
     * Builds HTTP headers for bot-authenticated requests.
     *
     * @return Configured {@link HttpHeaders} including JSON content type and bot token authorization.
     */
    private HttpHeaders botHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bot " + botToken);
        return headers;
    }

    /**
     * Ensures that mandatory configuration values are set.
     *
     * @throws IllegalStateException if required Discord configuration values are missing.
     */
    private void ensureConfigured() {
        if (botToken == null || botToken.isBlank()) {
            throw new IllegalStateException("discord.bot-token is not configured");
        }
        if (guildId == null || guildId.isBlank()) {
            throw new IllegalStateException("discord.guild-id is not configured");
        }
    }
}
