package org.example.codenames.unitTests.discordTests.service;

import org.example.codenames.discord.service.impl.DiscordGuildService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link DiscordGuildService}.
 */
class DiscordGuildServiceTest {
    private RestTemplate restTemplate;
    private DiscordGuildService discordGuildService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        restTemplate = mock(RestTemplate.class);
        discordGuildService = new DiscordGuildService();

        setPrivateField(discordGuildService, "restTemplate", restTemplate);
        setPrivateField(discordGuildService, "botToken", "BOT_TOKEN_123");
        setPrivateField(discordGuildService, "guildId", "GUILD_123");
        setPrivateField(discordGuildService, "categoryId", "CATEGORY_123");
    }

    /**
     * Tests that a voice channel is successfully created and ID is returned.
     */
    @Test
    void testCreateVoiceChannel_Success() {
        ResponseEntity<Map<String, Object>> mockResponse = new ResponseEntity<>(Map.of("id", "VOICE_CHANNEL_1"), HttpStatus.OK);
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(Map.class))).thenReturn((ResponseEntity) mockResponse);

        String channelId = discordGuildService.createVoiceChannel("TestChannel", 10);

        assertEquals("VOICE_CHANNEL_1", channelId);
        verify(restTemplate, times(1)).exchange(contains("/channels"), eq(HttpMethod.POST), any(), eq(Map.class));
    }

    /**
     * Tests that an exception is thrown when channel creation fails.
     */
    @Test
    void testCreateVoiceChannel_Failure() {
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(Map.class))).thenThrow(new RestClientException("Discord error"));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> discordGuildService.createVoiceChannel("FailChannel", 5));

        assertTrue(ex.getMessage().contains("Could not create channel:"));
    }

    /**
     * Tests that an invite link is successfully created and returned.
     */
    @Test
    void testCreateInvite_Success() {
        ResponseEntity<Map<String, Object>> mockResponse = new ResponseEntity<>(Map.of("code", "XYZ123"), HttpStatus.OK);
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(Map.class))).thenReturn((ResponseEntity) mockResponse);

        String inviteUrl = discordGuildService.createInvite("CHANNEL_123");

        assertEquals("https://discord.gg/XYZ123", inviteUrl);
    }

    /**
     * Tests that an exception is thrown if adding a member to guild fails.
     */
    @Test
    void testAddMember_Failure() {
        doThrow(new RestClientException("API error")).when(restTemplate).exchange(anyString(), eq(HttpMethod.PUT), any(), eq(String.class));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> discordGuildService.addMember("USER_1", "ACCESS_TOKEN_1"));

        assertTrue(ex.getMessage().contains("Failed to add Discord user"));
    }

    /**
     * Tests that deleting a channel does not throw an exception.
     */
    @Test
    void testDeleteChannel_Success() {
        when(restTemplate.exchange(anyString(), eq(HttpMethod.DELETE), any(), eq(String.class))).thenReturn(ResponseEntity.ok("OK"));

        assertDoesNotThrow(() -> discordGuildService.deleteChannel("CHAN_42"));

        verify(restTemplate, times(1)).exchange(contains("/channels"), eq(HttpMethod.DELETE), any(), eq(String.class));
    }

    /**
     * Utility to set private field values via reflection.
     */
    private void setPrivateField(Object target, String fieldName, Object value) {
        try {
            var field = target.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
