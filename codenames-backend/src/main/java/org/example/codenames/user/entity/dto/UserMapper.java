package org.example.codenames.user.entity.dto;

import org.example.codenames.user.entity.User;

import java.util.List;

/**
 * Mapper class for converting User entities to UserRoomLobbyDTO objects.
 * This class contains methods to convert a single User object and a list of User objects
 * into their corresponding DTO representations.
 */
public class UserMapper {
    /**
     * Converts a User object to a UserRoomLobbyDTO object.
     *
     * @param user the User object to convert
     * @return the converted UserRoomLobbyDTO object
     */
    public static UserRoomLobbyDTO toRoomLobbyDTO(User user) {
        return UserRoomLobbyDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .profilePic(user.getProfilePic())
                .status(user.getStatus())
                .build();
    }

    /**
     * Converts a list of User objects to a list of UserRoomLobbyDTO objects.
     *
     * @param users the list of User objects to convert
     * @return the list of converted UserRoomLobbyDTO objects
     */
    public static List<List<UserRoomLobbyDTO>> toRoomLobbyDTOList(List<List<User>> users) {
        return users.stream()
                .map(innerList -> innerList.stream()
                        .map(UserMapper::toRoomLobbyDTO)
                        .toList())
                .toList();
    }
}
