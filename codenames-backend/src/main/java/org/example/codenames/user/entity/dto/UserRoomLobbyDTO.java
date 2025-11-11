package org.example.codenames.user.entity.dto;

import lombok.Builder;
import lombok.Data;
import org.example.codenames.user.entity.User;
import org.springframework.data.annotation.Id;

@Data
@Builder
public class UserRoomLobbyDTO {

    @Id
    private String id;
    private String username;
    private int profilePic;
    private User.userStatus status;
}
