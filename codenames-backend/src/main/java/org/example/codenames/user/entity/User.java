package org.example.codenames.user.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Entity class for the User object.
 */
@Document(collection = "users")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class User {
    /**
     * The unique identifier for the user.
     */
    @Id
    private String id;

    /**
     * The username for the user.
     */
    private String username;

    /**
     * The password for the user.
     */
    private String password;

    /**
     * The email for the user.
     */
    private String email;

    /**
     * The roles for the user.
     */
    private String roles;

    /**
     * The flag indicating if the user is a guest.
     */
    private boolean isGuest;
}
