package org.example.codenames.user.entity.dto;

import lombok.Builder;
import lombok.Data;
import org.example.codenames.user.entity.User;
import org.springframework.data.annotation.Id;

@Data
@Builder
public class UserRoomLobbyDTO {
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
     * The number of profile picture for the user.
     */
    private int profilePic;

    /**
     * User status.
     */
    private User.userStatus status;
}
