package org.example.codenames.user.entity.dto;

import org.example.codenames.user.entity.User;

import java.util.List;

public class UserMapper {
    public static UserRoomLobbyDTO toRoomLobbyDTO(User user) {
        UserRoomLobbyDTO dto = new UserRoomLobbyDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setProfilePic(user.getProfilePic());
        dto.setStatus(user.getStatus());

        return dto;
    }

    public static List<List<UserRoomLobbyDTO>> toRoomLobbyDTOList(List<List<User>> users) {
        return users.stream()
                .map(innerList -> innerList.stream()
                        .map(UserMapper::toRoomLobbyDTO)
                        .toList())
                .toList();
    }
}
