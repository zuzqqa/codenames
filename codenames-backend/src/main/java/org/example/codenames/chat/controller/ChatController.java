package org.example.codenames.chat.controller;

import org.example.codenames.chat.entity.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @MessageMapping("/send/{gameId}") // Client sends messages to "/chat/send/{gameId}"
    @SendTo("/topic/{gameId}/messages") // Broadcasts to subscribers of "/topic/{gameId}/messages"
    public ChatMessage sendMessage(ChatMessage message) {
        return message; // Broadcast the message to the specific game channel
    }
}
