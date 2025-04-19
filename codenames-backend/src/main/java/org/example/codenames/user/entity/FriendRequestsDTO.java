package org.example.codenames.user.entity;

import java.util.List;

public class FriendRequestsDTO {
    private List<String> friends;
    private List<String> sentRequests;
    private List<String> receivedRequests;

    public FriendRequestsDTO(List<String> friends, List<String> sentRequests, List<String> receivedRequests) {
        this.friends = friends;
        this.sentRequests = sentRequests;
        this.receivedRequests = receivedRequests;
    }

    public List<String> getFriends() {
        return friends;
    }

    public List<String> getSentRequests() {
        return sentRequests;
    }

    public List<String> getReceivedRequests() {
        return receivedRequests;
    }
}

