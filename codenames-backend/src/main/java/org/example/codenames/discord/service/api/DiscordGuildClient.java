package org.example.codenames.discord.service.api;

public interface DiscordGuildClient {
    void addMember(String discordUserId, String userAccessToken);

    String createVoiceChannel(String channelName, int userLimit);

    String createInvite(String channelId, int maxAgeSeconds, int maxUses);

    void deleteChannel(String channelId);
}
