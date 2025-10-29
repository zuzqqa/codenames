package org.example.codenames.gameSession.entity.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Builder
@Getter
@Setter
public class LeaderVoteState {
    private boolean voteState;
}
