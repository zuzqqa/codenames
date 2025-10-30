package org.example.codenames.unitTests.discordTests.controller;

import org.example.codenames.discord.controller.api.LinkDiscordController;
import org.example.codenames.jwt.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for {@link LinkDiscordController}
 */
@WebMvcTest(LinkDiscordController.class)
@AutoConfigureMockMvc(addFilters = false)
class LinkDiscordControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JwtService jwtService;

    /**
     * Should return redirect URL and set cookie when JWT is valid
     */
    @Test
    void begin_ShouldReturnRedirectUrl_WhenValidJwt() throws Exception {
        String fakeJwt = "fake.jwt.token";
        when(jwtService.getUsernameFromToken(fakeJwt)).thenReturn("testUser");

        mockMvc.perform(post("/api/discord/link/begin")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + fakeJwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.redirectUrl").value("/oauth2/authorization/discord"))
                .andExpect(cookie().exists("APP_LINK_JWT"));
    }

    /**
     * Should return 400 when Authorization header is missing
     */
    @Test
    void begin_ShouldReturnBadRequest_WhenMissingAuthHeader() throws Exception {
        mockMvc.perform(post("/api/discord/link/begin"))
                .andExpect(status().isBadRequest());
    }

    /**
     * Should return 400 when Authorization header is malformed
     */
    @Test
    void begin_ShouldReturnBadRequest_WhenInvalidAuthHeader() throws Exception {
        mockMvc.perform(post("/api/discord/link/begin")
                        .header(HttpHeaders.AUTHORIZATION, "InvalidToken"))
                .andExpect(status().isBadRequest());
    }
}
