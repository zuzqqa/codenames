package org.example.codenames.chat.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * ChatMessage entity class.
 */
@Getter
@Setter
@AllArgsConstructor
public class ChatMessage {
    /**
     * The sender of the message
     */
    private String sender;

    /**
     * The content of the message
     */
    private String content;
}