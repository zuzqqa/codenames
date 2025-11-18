package org.example.codenames.integrationTests;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class DiscordLinkControllerTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mvc;


    @Test
    public void begin_withValidAuthorization_setsCookieAndReturnsRedirect() throws Exception {
        String token = "fake.jwt.token";
        when(jwtService.getUsernameFromToken(token)).thenReturn("user1");

        mvc.perform(post("/api/discord/link/begin")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.redirectUrl").exists())
                .andExpect(cookie().exists("APP_LINK_JWT"));
    }

    @Test
    public void begin_withMissingAuthorization_returnsBadRequest() throws Exception {
        mvc.perform(post("/api/discord/link/begin"))
                .andExpect(status().isBadRequest());
    }
}
