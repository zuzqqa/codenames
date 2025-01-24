package org.example.codenames.chat.controller;
import org.example.codenames.chat.entity.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @MessageMapping("/send") // Client sends messages to "/chat/send"
    @SendTo("/topic/messages") // Broadcasts to subscribers of "/topic/messages"
    public ChatMessage sendMessage(ChatMessage message) {
        return message; // Broadcast the message
    }
}
