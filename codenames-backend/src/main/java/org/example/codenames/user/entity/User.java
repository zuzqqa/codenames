package org.example.codenames.user.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


@Document(collection = "users")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class User {

    @Id
    private String id;
    private String username;
    private String password;
    private String email;
    private String resetId;
    private String roles;
    private boolean isGuest;
}
