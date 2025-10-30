package org.example.codenames.discord.controller.impl;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;

public interface DiscordLinkController {
    @PostMapping("/begin")
    ResponseEntity<?> begin(
            @RequestHeader("Authorization") String authHeader,
            HttpServletResponse response
    );
}
