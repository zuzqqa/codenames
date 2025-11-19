package org.example.codenames.user.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Document(collection = "users")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class User {

    @Id
    private String id;
    private String username;
    private String password;
    private String email;
    private String discordUserId;
    private String description;
    private int profilePic;
    private String roles;
    private boolean isGuest;
    private userStatus status;
    @Builder.Default
    private List<String> friends = new ArrayList<>();
    @Builder.Default
    private List<String> sentRequests = new ArrayList<>();
    @Builder.Default
    private List<String> receivedRequests = new ArrayList<>();

    /**
     * Override the equals method to compare two User objects.
     *
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
     *
     * @return the hash code for the User object
     */
    @Override
    public int hashCode() {
        return Objects.hash(username);
    }

    /**
     * Enum for user status.
     */
    public enum userStatus {
        INACTIVE,
        ACTIVE
    }
}
