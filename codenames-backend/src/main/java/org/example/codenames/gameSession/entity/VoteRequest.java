package org.example.codenames.gameSession.entity;

import lombok.Data;

@Data
public class VoteRequest {

    private String userId;
    private String votedUserId;
}