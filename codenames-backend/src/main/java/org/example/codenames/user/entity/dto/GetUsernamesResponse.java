package org.example.codenames.user.entity.dto;

import lombok.*;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class GetUsernamesResponse {

    @NoArgsConstructor
    @AllArgsConstructor
    @Getter
    @Setter
    @Builder
    public static class User {
        private String id;
        private String username;
    }

    List<User> users;
}
