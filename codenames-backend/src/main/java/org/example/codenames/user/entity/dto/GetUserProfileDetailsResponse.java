package org.example.codenames.user.entity.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class GetUserProfileDetailsResponse {

    private String id;
    private String username;
    private String email;
    private String description;
    private int profilePic;
    private List<String> friends = new ArrayList<>();
    private List<String> sentRequests = new ArrayList<>();
    private List<String> receivedRequests = new ArrayList<>();
}
