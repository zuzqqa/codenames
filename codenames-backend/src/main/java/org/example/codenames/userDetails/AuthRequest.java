package org.example.codenames.userDetails;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AuthRequest class is used to store the username and password of the user
 */
@NoArgsConstructor
@AllArgsConstructor
@Data
public class AuthRequest {
    /**
     * The username of the user
     */
    private String username;

    /**
     * The password of the user
     */
    private String password;
}
