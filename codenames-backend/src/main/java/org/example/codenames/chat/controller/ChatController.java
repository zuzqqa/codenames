package org.example.codenames.chat.controller;

import org.example.codenames.chat.entity.ChatMessage;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

/**
 * Controller for handling chat messages
 */
@Controller
public class ChatController {
    /**
     * Receives a message from a client and broadcasts it to all subscribers of the game channel
     * @param message The message sent by the client
     * @return The message sent by the client
     */
    @MessageMapping("/send/{gameId}")
    @SendTo("/topic/{gameId}/messages")
    public ChatMessage sendMessage(ChatMessage message) {
        return message; // Broadcast the message to the specific game channel
    }
}
