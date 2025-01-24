package org.example.codenames.gameSession.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.example.codenames.user.entity.User;

@Data
@AllArgsConstructor
public class VoteResult {
    private User electedLeader;
}