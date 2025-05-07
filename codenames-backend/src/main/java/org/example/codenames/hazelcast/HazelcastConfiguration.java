package org.example.codenames.hazelcast;

import com.hazelcast.config.Config;
import com.hazelcast.config.MapConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for Hazelcast
 */
@Configuration
public class HazelcastConfiguration {
    @Bean
    public Config hazelcastConfig() {
        return new Config()
                .setInstanceName("hazelcast-instance")
                .addMapConfig(new MapConfig()
                        .setName("activeUsers")
                        .setTimeToLiveSeconds(180));
    }
}
