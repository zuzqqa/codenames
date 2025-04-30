package org.example.codenames.user.entity;

import lombok.Data;

/**
 * PasswordResetRequest is a class that represents the request body for changing the password.
 */
@Data
public class PasswordResetRequest {
    /**
     * The new password for the account.
     */
    private String password;
}

