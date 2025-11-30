package org.example.codenames.gameSession.entity;

import lombok.Data;

@Data
public class HintRequest {

    private String hint;
    private int hintNumber;
    private String initialHintNumber;
}