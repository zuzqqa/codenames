package org.example.codenames.gameSession.entity;

import lombok.Data;

import java.util.UUID;

@Data
public class VoteRequest {
    private UUID userId;
    private UUID votedUserId;
}