package org.example.codenames.user.entity.dto;

import lombok.*;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class GetUsernamesResponse {

    List<User> users;

    @NoArgsConstructor
    @AllArgsConstructor
    @Getter
    @Setter
    @Builder
    public static class User {

        private String id;
        private String username;
    }
}
