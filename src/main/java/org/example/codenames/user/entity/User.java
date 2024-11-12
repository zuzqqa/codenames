package org.example.codenames.user.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


@Document(collection = "users")
@AllArgsConstructor
@Getter
@Setter
@Builder
public class User {

    @Id
    private String id;
    private String username;
    private String password;
    private String email;
    private String roles;
}
