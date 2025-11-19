package org.example.codenames.user.entity.mapper;

import org.example.codenames.user.entity.User;
import org.example.codenames.user.entity.dto.GetUserProfileDetailsResponse;
import org.example.codenames.user.entity.dto.GetUserResponse;
import org.example.codenames.user.entity.dto.GetUsernamesResponse;
import org.example.codenames.user.entity.dto.UserRoomLobbyDTO;

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

    /**
     * Converts a User object to a GetUserProfileDetailsResponse object.
     *
     * @param user the User object to convert
     * @return the converted GetUserProfileDetailsResponse object
     */
    public static GetUserProfileDetailsResponse toGetUserProfileResponse(User user) {
        return GetUserProfileDetailsResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .description(user.getDescription())
                .profilePic(user.getProfilePic())
                .friends(user.getFriends())
                .receivedRequests(user.getReceivedRequests())
                .sentRequests(user.getSentRequests())
                .build();
    }

    /**
     * Converts a list of User objects to a GetUsernamesResponse object.
     *
     * @param users the list of User objects to convert
     * @return the converted GetUsernamesResponse object
     */
    public static GetUsernamesResponse toGetUsernamesResponse(List<User> users) {
        return GetUsernamesResponse.builder()
                .users(users.stream().map(user ->
                                GetUsernamesResponse.User.builder()
                                        .id(user.getId())
                                        .username(user.getUsername())
                                        .build())
                        .toList())
                .build();
    }

    /**
     * Converts a User object to a GetUserResponse object.
     *
     * @param user the User object to convert
     * @return the converted GetUserResponse object
     */
    public static GetUserResponse toGetUserResponse(User user) {
        return GetUserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .description(user.getDescription())
                .profilePic(user.getProfilePic())
                .friends(user.getFriends())
                .sentRequests(user.getSentRequests())
                .receivedRequests(user.getReceivedRequests())
                .build();
    }
}
