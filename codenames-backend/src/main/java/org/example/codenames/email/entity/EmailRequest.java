package org.example.codenames.email.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Represents the email request entity
 * Contains the email address and the data to send
 */
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class EmailRequest {
    /**
     * The email address to send the email to
     */
    private String email;

    /**
     * The subject of the email
     */
    private String dataToSend;
}
