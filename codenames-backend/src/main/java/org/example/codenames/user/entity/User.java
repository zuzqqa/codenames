package org.example.codenames.user.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Objects;

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
     * Enum for user status.
     */
    public enum userStatus {
        INACTIVE,
        ACTIVE
    }

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

    private String resetId;

     /**
     * The roles for the user.
     */
    private String roles;

    /**
     * The flag indicating if the user is a guest.
     */
    private boolean isGuest;

    /**
     * User status.
     */
    private userStatus status;

    /**
     * Override the equals method to compare two User objects.
     * @param obj the object to compare to
     * @return true if the objects are equal, false otherwise
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        User user = (User) obj;
        return Objects.equals(username, user.username);
    }

    /**
     * Override the hashCode method to generate a hash code for the User object.
     * @return the hash code for the User object
     */
    @Override
    public int hashCode() {
        return Objects.hash(username);
    }
}
