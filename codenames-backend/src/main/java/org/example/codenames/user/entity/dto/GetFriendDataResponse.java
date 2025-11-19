package org.example.codenames.user.entity.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Data Transfer Object for Friend Requests.
 * This class is used to transfer friend request data between the server and client.
 */
@Data
@Builder
public class GetFriendDataResponse {
    /**
     * List of friends.
     * This list contains the usernames of the friends of the user.
     */
    private List<String> friends;

    /**
     * List of sent friend requests.
     * This list contains the usernames of the users to whom the user has sent friend requests.
     */
    private List<String> sentRequests;

    /**
     * List of received friend requests.
     * This list contains the usernames of the users who have sent friend requests to the user.
     */
    private List<String> receivedRequests;
}
