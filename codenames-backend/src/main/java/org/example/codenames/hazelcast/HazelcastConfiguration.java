package org.example.codenames.hazelcast;

import com.hazelcast.config.Config;
import com.hazelcast.config.MapConfig;
import com.hazelcast.core.Hazelcast;
import com.hazelcast.core.HazelcastInstance;
import org.example.codenames.hazelcast.compactSerializers.gameSessionSerializers.GameSessionCompactSerializer;
import org.example.codenames.hazelcast.compactSerializers.gameSessionSerializers.GameStateCompactSerializer;
import org.example.codenames.hazelcast.compactSerializers.gameSessionSerializers.UserCompactSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Configuration class for Hazelcast
 */
@Configuration
public class HazelcastConfiguration {

    @Bean
    public Config hazelcastConfig() {
        Config config = new Config()
                .setInstanceName("hazelcast-instance")
                .addMapConfig(new MapConfig()
                        .setName("activeUsers")
                        .setTimeToLiveSeconds(180))
                .addMapConfig(new MapConfig()
                        .setName("gameSessions")
                        .setTimeToLiveSeconds(180));
        config.getSerializationConfig()
                .getCompactSerializationConfig()
                .addSerializer(new UserCompactSerializer())
                .addSerializer(new GameStateCompactSerializer())
                .addSerializer(new GameSessionCompactSerializer());

        return config;
    }

    @Bean
    @Primary
    public HazelcastInstance hazelcastInstance() {
        return Hazelcast.newHazelcastInstance(hazelcastConfig());
    }
}
