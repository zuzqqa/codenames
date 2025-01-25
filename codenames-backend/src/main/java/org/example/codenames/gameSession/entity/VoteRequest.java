package org.example.codenames.gameSession.entity;

import lombok.Data;

import java.util.UUID;

@Data
public class VoteRequest {
    private String userId;
    private String votedUserId;
}