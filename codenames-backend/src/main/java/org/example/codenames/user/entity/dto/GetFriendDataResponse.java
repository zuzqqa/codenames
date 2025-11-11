package org.example.codenames.user.entity.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class GetFriendDataResponse {

    private List<String> friends;
    private List<String> sentRequests;
    private List<String> receivedRequests;
}
